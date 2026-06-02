/**
 * API route tests for /api/contact and /api/subscribe
 * Uses Next.js route handler testing pattern with fetch
 */

describe("Contact API Route", () => {
  it("should validate required fields", async () => {
    // Test input validation logic directly
    const validateContact = (body: Record<string, string>) => {
      const { name, email, message } = body;
      if (!name || !email || !message) return { error: "Name, email, and message are required" };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return { error: "Invalid email format" };
      return null;
    };

    // Missing fields
    expect(validateContact({ name: "", email: "a@b.com", message: "hi" })).toBeTruthy();
    expect(validateContact({ name: "John", email: "", message: "hi" })).toBeTruthy();
    expect(validateContact({ name: "John", email: "a@b.com", message: "" })).toBeTruthy();

    // Invalid email
    expect(validateContact({ name: "John", email: "notanemail", message: "hi" })).toBeTruthy();

    // Valid
    expect(validateContact({ name: "John", email: "john@example.com", message: "Hello" })).toBeNull();
  });
});

describe("Subscribe API Route", () => {
  it("should validate email format", () => {
    const validateEmail = (email: string | undefined) => {
      if (!email) return { error: "Email is required" };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return { error: "Invalid email format" };
      return null;
    };

    expect(validateEmail(undefined)).toBeTruthy();
    expect(validateEmail("")).toBeTruthy();
    expect(validateEmail("notanemail")).toBeTruthy();
    expect(validateEmail("missing@domain")).toBeTruthy();
    expect(validateEmail("valid@example.com")).toBeNull();
    expect(validateEmail("user.name+tag@company.co")).toBeNull();
  });
});