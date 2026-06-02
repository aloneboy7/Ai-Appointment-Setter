import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { getUserByEmail, createUser, initDb } from "@/lib/models";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await initDb();
        const user = await getUserByEmail(credentials.email);

        if (!user) {
          throw new Error("No account found with this email");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  // Let NextAuth handle cookies automatically — it detects x-forwarded-proto
  // from Caddy and sets the right Secure/SameSite flags. The previous custom
  // cookie config with __Secure- prefix + explicit domain broke the proxy flow
  // because NextAuth internally sees HTTP (Caddy → localhost:3000).
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create Google OAuth users in our database
      if (account?.provider === "google" && user.email) {
        try {
          await initDb();
          const existingUser = await getUserByEmail(user.email);
          if (!existingUser) {
            const { hash } = await import("bcryptjs");
            const randomPassword = await hash(
              Math.random().toString(36) + Date.now().toString(36),
              12
            );
            const newUser = await createUser(
              user.name || "Google User",
              user.email,
              randomPassword
            );
            user.id = newUser.id.toString();
          } else {
            user.id = existingUser.id.toString();
          }
        } catch (error) {
          console.error("[auth] Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After successful OAuth callback, redirect to dashboard
      if (url.includes("/api/auth/callback")) {
        return `${baseUrl}/dashboard`;
      }
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Invalid URL, fall through
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};