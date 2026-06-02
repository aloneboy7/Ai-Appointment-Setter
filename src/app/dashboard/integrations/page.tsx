"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plug, Check, X, ExternalLink, RefreshCw, Shield,
  Calendar, Mail, MessageSquare, Video, CreditCard,
  Users, ShoppingCart, Hash, FileText, Layout, Headphones,
  Eye, EyeOff, AlertCircle, Settings2, ChevronDown, ChevronRight, BookOpen,
  Copy, CheckCircle2, Zap, Bot, Globe, Save, ToggleLeft,
  ToggleRight, Plus, Info, Upload, Trash2, Send
} from "lucide-react";
import { useSession } from "next-auth/react";

/* ── Dynamic base URL for setup instructions ── */
const BASE_URL = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000");

/* ── Integration config fields — what each service actually needs ── */
interface ConfigField {
  key: string;
  label: string;
  type: "text" | "email" | "tel" | "url" | "password" | "select";
  placeholder: string;
  required: boolean;
  helpText?: string;
  options?: { value: string; label: string }[];
}

interface SetupStep {
  title: string;
  detail: string;
}

interface IntegrationDef {
  key: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  color: string;
  popular?: boolean;
  configFields: ConfigField[];
  connectNote?: string;
  helpUrl?: string;
  setupSteps?: SetupStep[];
}

const INTEGRATION_CATALOG: IntegrationDef[] = [
  {
    key: "google_calendar",
    name: "Google Calendar",
    description: "Sync meetings and availability with Google Calendar automatically.",
    category: "Calendar",
    icon: Calendar,
    color: "#4285F4",
    popular: true,
    connectNote: "We'll use your Google account to read and create calendar events.",
    configFields: [
      { key: "client_id", label: "Google Client ID", type: "text", placeholder: "xxxx.apps.googleusercontent.com", required: true, helpText: "From Google Cloud Console → APIs & Services → Credentials" },
      { key: "client_secret", label: "Google Client Secret", type: "password", placeholder: "GOCSPX-xxxxx", required: true, helpText: "The secret key for your OAuth 2.0 Client" },
      { key: "calendar_id", label: "Calendar ID", type: "email", placeholder: "your-email@gmail.com", required: false, helpText: "Leave blank to use your primary calendar" },
      { key: "sync_direction", label: "Sync Direction", type: "select", placeholder: "Select", required: true, options: [
        { value: "bidirectional", label: "Bidirectional (read & write)" },
        { value: "read_only", label: "Read only (check availability)" },
        { value: "write_only", label: "Write only (create events)" },
      ]},
    ],
    helpUrl: "https://console.cloud.google.com/apis/credentials",
    setupSteps: [
      { title: "Go to Google Cloud Console", detail: "Open console.cloud.google.com and sign in with your Google account. Create a new project (click the project dropdown at the top → 'New Project'). Name it (e.g. 'AI Appointment Setter Calendar') and click 'Create'." },
      { title: "Enable the Google Calendar API", detail: "In the left sidebar, navigate to APIs & Services → Library. Search for 'Google Calendar API'. Click on it, then click 'Enable'. Wait for it to activate (usually instant)." },
      { title: "Configure the OAuth consent screen", detail: "Go to APIs & Services → OAuth consent screen. Select 'External' and click 'Create'. Fill in the required fields: App name ('AI Appointment Setter'), User support email, Developer contact email. Click 'Save and Continue' through each step. On 'Scopes', add '.../auth/calendar.events' and '.../auth/calendar.readonly'. On 'Test users', add your Gmail address." },
      { title: "Create OAuth 2.0 credentials", detail: `Go to APIs & Services → Credentials. Click '+ Create Credentials' → 'OAuth client ID'. Select 'Web application'. Name it 'Calendar Integration'. Under 'Authorized redirect URIs', click 'Add URI' and paste exactly: ${BASE_URL}/api/auth/callback/google — use the copy button to avoid whitespace errors. Under 'Authorized JavaScript origins', add: ${BASE_URL}. Click 'Create'.` },
      { title: "Copy credentials and connect", detail: "Copy the Client ID (ends in .apps.googleusercontent.com) and Client Secret (starts with GOCSPX-). Paste them above. Enter your Calendar ID (usually your Gmail address, or leave blank for primary calendar). Select sync direction and click 'Connect'." },
    ],
  },
  {
    key: "outlook",
    name: "Outlook Calendar",
    description: "Connect Microsoft Outlook for seamless scheduling and email.",
    category: "Calendar",
    icon: Calendar,
    color: "#0078D4",
    popular: true,
    configFields: [
      { key: "tenant_id", label: "Azure Tenant ID", type: "text", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", required: true, helpText: "From Azure Portal → App Registrations" },
      { key: "client_id", label: "Application (Client) ID", type: "text", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", required: true },
      { key: "client_secret", label: "Client Secret", type: "password", placeholder: "abc123~DEF-xxxxx", required: true },
      { key: "email", label: "Outlook Email", type: "email", placeholder: "you@company.com", required: true, helpText: "The email account to sync calendar with" },
    ],
    helpUrl: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade",
  },
  {
    key: "gmail",
    name: "Gmail",
    description: "Send and track lead follow-up emails directly through Gmail.",
    category: "Email",
    icon: Mail,
    color: "#EA4335",
    popular: true,
    connectNote: "Gmail uses OAuth 2.0 for secure access. No app password or 2-Step Verification required. Click 'View setup guide' below for step-by-step instructions.",
    configFields: [
      { key: "sender_email", label: "Sender Gmail Address", type: "email", placeholder: "you@gmail.com", required: true, helpText: "The Gmail address to send follow-ups from" },
      { key: "app_password", label: "Gmail App Password", type: "password", placeholder: "abcd efgh ijkl mnop", required: true, helpText: "16-character password from Google (see setup guide to generate one)" },
      { key: "sender_name", label: "Display Name", type: "text", placeholder: "Your Company Name", required: true, helpText: "Name shown in the 'From' field" },
      { key: "reply_to", label: "Reply-To Email", type: "email", placeholder: "replies@company.com", required: false, helpText: "Where lead replies go (leave blank to use sender email)" },
    ],
    helpUrl: "https://console.cloud.google.com/apis/credentials",
    setupSteps: [
      { title: "Enable 2-Step Verification on your Google Account", detail: "Go to myaccount.google.com/signinoptions/two-step-verification. Sign in and follow the prompts to set up 2FA using your phone number or an authenticator app. App Passwords are ONLY available after enabling 2-Step Verification." },
      { title: "Generate an App Password", detail: "After enabling 2FA, go to myaccount.google.com/apppasswords. In the 'App name' field, type 'AI Appointment Setter' and click 'Create'. Google will show a 16-character password in groups of 4 (e.g. abcd efgh ijkl mnop). Copy this password — you'll need it below." },
      { title: "Enter your Gmail credentials", detail: "In the form above: Paste your Gmail address in 'Sender Gmail Address'. Paste the 16-character App Password in 'Gmail App Password' (without spaces is fine). Enter your display name (e.g. 'Your Company'). Optionally set a reply-to email." },
      { title: "Click Connect to activate", detail: "Click 'Connect' to save your credentials. The platform will verify the connection. Once connected, every new lead, demo booking, and contact form submission will automatically trigger a personalized email from your Gmail." },
    ],
  },
  {
    key: "slack",
    name: "Slack",
    description: "Get instant notifications and lead alerts in your Slack channels.",
    category: "Communication",
    icon: Hash,
    color: "#4A154B",
    popular: true,
    configFields: [
      { key: "webhook_url", label: "Incoming Webhook URL", type: "url", placeholder: "https://hooks.slack.com/services/T000/B000/xxx", required: true, helpText: "Create at api.slack.com/messaging/webhooks" },
      { key: "channel", label: "Default Channel", type: "text", placeholder: "#leads", required: true, helpText: "Channel for lead notifications" },
      { key: "bot_token", label: "Bot User OAuth Token (optional)", type: "password", placeholder: "xoxb-xxxxx", required: false, helpText: "For posting as a custom bot instead of webhook" },
    ],
    helpUrl: "https://api.slack.com/messaging/webhooks",
    setupSteps: [
      { title: "Create a Slack app", detail: "Go to api.slack.com/apps and click 'Create New App'. Choose 'From scratch'. Give it a name (e.g. 'AI Appointment Setter Alerts') and select the workspace you want to post to. Click 'Create App'." },
      { title: "Enable Incoming Webhooks", detail: "In your app's settings page, click 'Incoming Webhooks' in the left sidebar. Toggle 'Activate Incoming Webhooks' to On. Click 'Add New Webhook to Workspace' at the bottom." },
      { title: "Select a channel and copy the Webhook URL", detail: "Slack will ask you to pick a channel (e.g. #leads or #notifications). Select it and click 'Allow'. You'll see a Webhook URL that looks like https://hooks.slack.com/services/T.../B.../xxx — copy this entire URL into the 'Incoming Webhook URL' field above." },
      { title: "Add a Bot Token (optional)", detail: "For posting as a custom bot with more control, go to 'OAuth & Permissions' in your app settings. Add the 'chat:write' scope. Click 'Install to Workspace'. Copy the 'Bot User OAuth Token' (starts with xoxb-) into the 'Bot User OAuth Token' field above." },
      { title: "Paste your channel name and connect", detail: "Enter the default channel name (e.g. #leads) where notifications should appear. Click 'Connect' to activate. Test by sending a test message from the integrations page." },
    ],
  },
  {
    key: "whatsapp",
    name: "WhatsApp Business",
    description: "Engage leads on WhatsApp with automated messages and follow-ups.",
    category: "Communication",
    icon: MessageSquare,
    color: "#25D366",
    popular: true,
    configFields: [
      { key: "phone_number", label: "WhatsApp Business Phone", type: "tel", placeholder: "+1 (555) 123-4567", required: true, helpText: "Your WhatsApp Business phone number with country code" },
      { key: "api_key", label: "Meta Business API Key", type: "password", placeholder: "EAAxxxxxxx", required: true, helpText: "From Meta Business Suite → WhatsApp → API Setup" },
      { key: "phone_number_id", label: "Phone Number ID", type: "text", placeholder: "xxxxxxxxx", required: true, helpText: "Found in Meta Business Suite → WhatsApp → Phone Numbers" },
      { key: "business_account_id", label: "Business Account ID", type: "text", placeholder: "xxxxxxxxx", required: true, helpText: "From Meta Business Suite → Business Settings" },
      { key: "webhook_verify_token", label: "Webhook Verify Token", type: "text", placeholder: "my_custom_token", required: false, helpText: "Used to verify incoming webhook messages" },
    ],
    helpUrl: "https://business.facebook.com/wa/manage/numbers/",
    setupSteps: [
      { title: "Create a Meta Business Account", detail: "Go to business.facebook.com and click 'Create Account'. Enter your business name, your name, and business email. Complete the verification process (Meta may send a verification code to your email or phone)." },
      { title: "Add a WhatsApp Business profile", detail: "In Meta Business Suite, go to WhatsApp → Account. Click 'Add phone number' and follow the prompts to register your business phone number. You'll receive a verification code via SMS or phone call to that number." },
      { title: "Create a WhatsApp Business app in Meta", detail: "Go to developers.facebook.com → My Apps → Create App. Select 'Business' as the app type. Give it a name (e.g. 'AI Appointment Setter') and link it to your Business Account. Once created, go to app settings and add the 'WhatsApp' product." },
      { title: "Generate your API credentials", detail: "In your app dashboard, go to WhatsApp → API Setup. You'll see a temporary access token (starts with EAA...) — copy this as your 'Meta Business API Key'. You'll also see a Phone Number ID and a WhatsApp Business Account ID — copy both of these." },
      { title: "Configure the webhook (optional)", detail: "For receiving incoming messages, go to WhatsApp → Configuration. Click 'Edit' on the Webhook section. Set the Callback URL to your server endpoint and create a Verify Token (any string you choose). Enter the same token in the 'Webhook Verify Token' field above." },
      { title: "Paste credentials and connect", detail: "Copy the Phone Number, API Key, Phone Number ID, and Business Account ID from the Meta Developer dashboard into the fields above. Click 'Connect' to activate the integration." },
    ],
  },
  {
    key: "zoom",
    name: "Zoom",
    description: "Auto-create Zoom meeting links when appointments are booked.",
    category: "Video",
    icon: Video,
    color: "#2D8CFF",
    configFields: [
      { key: "account_id", label: "Zoom Account ID", type: "text", placeholder: "xxxxxxxxx", required: true, helpText: "From Zoom Marketplace → Server-to-Server OAuth" },
      { key: "client_id", label: "Client ID", type: "text", placeholder: "xxxxxxxxx", required: true },
      { key: "client_secret", label: "Client Secret", type: "password", placeholder: "xxxxxxxxx", required: true },
      { key: "default_meeting_type", label: "Default Meeting Type", type: "select", placeholder: "Select", required: true, options: [
        { value: "2", label: "Scheduled Meeting" },
        { value: "8", label: "Recurring Meeting (no fixed time)" },
        { value: "1", label: "Instant Meeting" },
      ]},
    ],
    helpUrl: "https://marketplace.zoom.us/develop/create",
    setupSteps: [
      { title: "Go to Zoom Marketplace", detail: "Open marketplace.zoom.us and sign in with your Zoom account. Click 'Develop' → 'Build App' in the top navigation bar." },
      { title: "Create a Server-to-Server OAuth app", detail: "Select 'Server-to-Server OAuth' as the app type. This allows your integration to create meetings without user interaction. Enter an App Name (e.g. 'AI Appointment Setter'), a description, and your company details. Click 'Create'." },
      { title: "Copy your Account ID, Client ID, and Client Secret", detail: "After creating the app, you'll see the 'App Credentials' page. Copy the 'Account ID', 'Client ID', and 'Client Secret' values. Paste them into the corresponding fields above. Keep the Client Secret secure — it grants full access to your Zoom account." },
      { title: "Configure the required scopes", detail: "Go to the 'Scopes' tab in your app settings. Add these scopes: 'meeting:write:admin' (to create meetings), 'meeting:read:admin' (to view scheduled meetings), 'user:read:admin' (to get user info). Click 'Save'." },
      { title: "Activate the app and connect", detail: "Go to the 'Activation' tab. Click 'Activate'. Your credentials are now live. Choose your default meeting type above (Scheduled, Recurring, or Instant). Click 'Connect' to activate the integration." },
    ],
  },
  {
    key: "stripe",
    name: "Stripe",
    description: "Process payments and manage subscriptions for your services.",
    category: "Payments",
    icon: CreditCard,
    color: "#635BFF",
    configFields: [
      { key: "publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_live_xxxxx", required: true, helpText: "Safe to use publicly (starts with pk_)" },
      { key: "secret_key", label: "Secret Key", type: "password", placeholder: "sk_live_xxxxx", required: true, helpText: "Keep this secret! (starts with sk_)" },
      { key: "webhook_secret", label: "Webhook Signing Secret", type: "password", placeholder: "whsec_xxxxx", required: false, helpText: "For verifying webhook events" },
      { key: "currency", label: "Default Currency", type: "select", placeholder: "Select", required: true, options: [
        { value: "usd", label: "USD ($)" },
        { value: "eur", label: "EUR (€)" },
        { value: "gbp", label: "GBP (£)" },
        { value: "inr", label: "INR (₹)" },
        { value: "cad", label: "CAD (C$)" },
        { value: "aud", label: "AUD (A$)" },
      ]},
    ],
    helpUrl: "https://dashboard.stripe.com/apikeys",
    setupSteps: [
      { title: "Sign up or log in to Stripe", detail: "Go to stripe.com and create an account (or log in to your existing one). Complete the business verification process — you'll need your business name, address, and bank account details for payouts." },
      { title: "Get your API keys", detail: "In the Stripe Dashboard, go to Developers → API Keys (left sidebar). You'll see two keys: 'Publishable key' (starts with pk_test_ or pk_live_) and 'Secret key' (starts with sk_test_ or sk_live_). Copy both values into the fields above. Use 'test' keys during development, 'live' keys for production." },
      { title: "Set up webhooks (optional but recommended)", detail: `Go to Developers → Webhooks. Click 'Add endpoint'. Set the URL to ${BASE_URL}/api/webhooks/stripe. Select events: 'checkout.session.completed', 'invoice.payment_succeeded', 'customer.subscription.updated'. After creating, click into the webhook and copy the 'Signing secret' (starts with whsec_). Paste it into the 'Webhook Signing Secret' field above.` },
      { title: "Choose your currency and connect", detail: "Select your default currency from the dropdown above (the currency your customers will be charged in). Click 'Connect' to activate. Test with test keys first to verify the integration works before switching to live keys." },
    ],
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description: "Sync leads, contacts, and deal pipelines with HubSpot CRM.",
    category: "CRM",
    icon: Users,
    color: "#FF7A59",
    popular: true,
    configFields: [
      { key: "access_token", label: "Private App Access Token", type: "password", placeholder: "pat-na1-xxxxx", required: true, helpText: "From HubSpot → Settings → Integrations → Private Apps" },
      { key: "portal_id", label: "Portal ID (Hub ID)", type: "text", placeholder: "12345678", required: true, helpText: "Found in the top-right of your HubSpot dashboard" },
      { key: "sync_contacts", label: "Sync Contacts", type: "select", placeholder: "Select", required: true, options: [
        { value: "bidirectional", label: "Bidirectional" },
        { value: "to_hubspot", label: "One-way (→ HubSpot)" },
        { value: "from_hubspot", label: "One-way (← HubSpot)" },
      ]},
    ],
    helpUrl: "https://app.hubspot.com/settings/integrations/private-apps",
    setupSteps: [
      { title: "Find your Portal ID (Hub ID)", detail: "Log in to HubSpot at app.hubspot.com. Look at the top-right corner of your dashboard — you'll see your account name with a number in parentheses (e.g. 'My Company (12345678)'). That number is your Portal ID. Copy it into the 'Portal ID' field above." },
      { title: "Create a Private App", detail: "Go to Settings (gear icon) → Integrations → Private Apps. Click 'Create a private app'. Enter a name like 'AI Appointment Setter'. Add a description if you wish." },
      { title: "Configure the required scopes", detail: "In the Private App editor, go to the 'Scopes' tab. Add these scopes: 'crm.objects.contacts.read/write' (to sync leads), 'crm.objects.deals.read/write' (to create deal records), 'crm.objects.owners.read' (to assign owners). Click 'Save'." },
      { title: "Generate and copy the Access Token", detail: "After saving, go to the 'Access' tab. Click 'Show token'. Copy the token (starts with pat-na1-...) and paste it into the 'Private App Access Token' field above. This token won't be shown again after you close this dialog." },
      { title: "Choose your sync direction and connect", detail: "Select how contacts should sync: Bidirectional (both systems update each other), One-way to HubSpot (AI Appointment Setter pushes leads only), or One-way from HubSpot (pull contacts only). Click 'Connect' to activate." },
    ],
  },
  {
    key: "salesforce",
    name: "Salesforce",
    description: "Push qualified leads and activities directly into Salesforce.",
    category: "CRM",
    icon: Users,
    color: "#00A1E0",
    popular: true,
    configFields: [
      { key: "instance_url", label: "Instance URL", type: "url", placeholder: "https://yourorg.my.salesforce.com", required: true },
      { key: "client_id", label: "Consumer Key", type: "text", placeholder: "xxxxxxxxx", required: true, helpText: "From Salesforce → Setup → App Manager → Connected App" },
      { key: "client_secret", label: "Consumer Secret", type: "password", placeholder: "xxxxxxxxx", required: true },
      { key: "username", label: "Salesforce Username", type: "email", placeholder: "admin@company.com", required: true },
      { key: "security_token", label: "Security Token", type: "password", placeholder: "xxxxxxxxx", required: true, helpText: "From Salesforce → Settings → My Personal Information → Reset Security Token" },
    ],
    helpUrl: "https://help.salesforce.com/s/articleView?id=sf.remoteaccess_create_connected_app.htm",
    setupSteps: [
      { title: "Create a Connected App in Salesforce", detail: "Log in to Salesforce. Click the gear icon → Setup. In the left sidebar, go to Platform Tools → Apps → App Manager. Click 'New Connected App' in the top-right. Fill in the required fields: App Name (e.g. 'AI Appointment Setter'), API Name (auto-generated), and Contact Email." },
      { title: "Configure OAuth settings", detail: `In the Connected App form, check 'Enable OAuth Settings'. Set the Callback URL to ${BASE_URL}/api/integrations/callback/salesforce — use the copy button to avoid whitespace. In 'Selected OAuth Scopes', add: 'api' (Access and manage your data), 'refresh_token, offline_access' (Perform requests at any time). Click 'Save'.` },
      { title: "Copy Consumer Key and Secret", detail: "After saving, click 'Continue'. You'll see the 'Consumer Key' and 'Consumer Secret'. Copy both values. The Consumer Key goes in the 'Consumer Key' field above, and the Consumer Secret goes in the 'Consumer Secret' field above." },
      { title: "Get your Security Token", detail: "Click your profile picture → Settings. In the left sidebar, go to My Personal Information → Reset My Security Token. Click 'Reset Security Token'. Salesforce will email you a new token. Copy it into the 'Security Token' field above. Note: If you can't see this option, your admin may have disabled it — contact your Salesforce administrator." },
      { title: "Enter your Instance URL and connect", detail: "Your Instance URL is the URL you see when logged into Salesforce (e.g. https://yourorg.my.salesforce.com). Copy just the base URL into the 'Instance URL' field. Enter your Salesforce username. Click 'Connect' to activate the integration." },
    ],
  },
  {
    key: "calendly",
    name: "Calendly",
    description: "Let leads self-schedule with Calendly integration and auto-sync.",
    category: "Calendar",
    icon: Calendar,
    color: "#006BFF",
    configFields: [
      { key: "access_token", label: "Personal Access Token", type: "password", placeholder: "xxxxxxxxx", required: true, helpText: "From Calendly → Integrations & Apps → API & Webhooks" },
      { key: "webhook_url", label: "Webhook Signing Key", type: "password", placeholder: "xxxxxxxxx", required: false, helpText: "For receiving real-time booking events" },
      { key: "scheduling_link", label: "Default Scheduling Link", type: "url", placeholder: "https://calendly.com/your-name/30min", required: false, helpText: "Your main booking page URL" },
    ],
    helpUrl: "https://calendly.com/integrations/api_webhooks",
  },
  {
    key: "notion",
    name: "Notion",
    description: "Log meeting notes and lead details into your Notion workspace.",
    category: "Productivity",
    icon: FileText,
    color: "#000000",
    configFields: [
      { key: "api_key", label: "Integration Token", type: "password", placeholder: "secret_xxxxx", required: true, helpText: "From notion.so/my-integrations → New Integration" },
      { key: "database_id", label: "Database ID", type: "text", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", required: true, helpText: "The ID from your Notion database URL" },
    ],
    helpUrl: "https://www.notion.so/my-integrations",
  },
  {
    key: "trello",
    name: "Trello",
    description: "Create cards and move leads through your Trello boards.",
    category: "Productivity",
    icon: Layout,
    color: "#0079BF",
    configFields: [
      { key: "api_key", label: "API Key", type: "text", placeholder: "xxxxxxxxx", required: true, helpText: "From trello.com/app-key" },
      { key: "api_token", label: "API Token", type: "password", placeholder: "xxxxxxxxx", required: true, helpText: "Generate at trello.com/authorize" },
      { key: "board_id", label: "Board ID", type: "text", placeholder: "xxxxxxxxx", required: false, helpText: "The board to create cards on (find in board URL)" },
      { key: "list_name", label: "Default List Name", type: "text", placeholder: "New Leads", required: false, helpText: "Which list to add new lead cards to" },
    ],
    helpUrl: "https://trello.com/app-key",
  },
  {
    key: "discord",
    name: "Discord",
    description: "Send lead notifications and updates to your Discord server.",
    category: "Communication",
    icon: Headphones,
    color: "#5865F2",
    configFields: [
      { key: "webhook_url", label: "Webhook URL", type: "url", placeholder: "https://discord.com/api/webhooks/xxxxx/xxxxx", required: true, helpText: "Server Settings → Integrations → Webhooks → New Webhook" },
      { key: "bot_name", label: "Bot Display Name", type: "text", placeholder: "AI Appointment Setter", required: false, helpText: "Name shown when posting messages" },
    ],
    helpUrl: "https://support.discord.com/hc/en-us/articles/228383668",
  },
  {
    key: "shopify",
    name: "Shopify",
    description: "Capture leads from your Shopify store and automate follow-ups.",
    category: "E-Commerce",
    icon: ShoppingCart,
    color: "#95BF47",
    configFields: [
      { key: "store_url", label: "Store URL", type: "url", placeholder: "https://your-store.myshopify.com", required: true },
      { key: "access_token", label: "Admin API Access Token", type: "password", placeholder: "shpat_xxxxx", required: true, helpText: "From Shopify Admin → Apps → Develop Apps → Your App" },
      { key: "webhook_secret", label: "Webhook Secret", type: "password", placeholder: "xxxxxxxxx", required: false, helpText: "For verifying webhook events from Shopify" },
    ],
    helpUrl: "https://admin.shopify.com/store/*/apps/develop",
  },
  {
    key: "microsoft_teams",
    name: "Microsoft Teams",
    description: "Get real-time lead alerts and meeting reminders in Teams.",
    category: "Communication",
    icon: MessageSquare,
    color: "#5059C9",
    configFields: [
      { key: "webhook_url", label: "Incoming Webhook URL", type: "url", placeholder: "https://outlook.office.com/webhook/xxxxx", required: true, helpText: "Teams channel → Connectors → Incoming Webhook" },
      { key: "channel_name", label: "Channel Name", type: "text", placeholder: "#leads", required: false },
    ],
    helpUrl: "https://support.microsoft.com/en-us/office/create-incoming-webhooks",
  },
];

const CATEGORIES = ["All", "Calendar", "CRM", "Email", "Communication", "Video", "Payments", "Productivity", "E-Commerce"];

interface Connection {
  integration_key: string;
  status: string;
  connected_at: string;
  settings: Record<string, unknown>;
}

export default function IntegrationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [configModal, setConfigModal] = useState<IntegrationDef | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [configErrors, setConfigErrors] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [configSuccess, setConfigSuccess] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [testResult, setTestResult] = useState<{ key: string; success: boolean; message: string } | null>(null);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // ── Email Automation Settings (inline on Gmail card) ──
  
  const [emailSettings, setEmailSettings] = useState({
    auto_reply_enabled: true,
    reply_mode: "replies_and_inquiries",
    skip_marketing: true,
    skip_newsletters: true,
    skip_social: true,
    skip_transactional: true,
    skip_job_alerts: true,
    custom_skip_domains: [] as string[],
    custom_allow_emails: [] as string[],
    reply_tone: "professional",
    max_replies_per_day: 50,
    custom_instructions: "",
  });
  const [emailSettingsSaved, setEmailSettingsSaved] = useState(false);
  const [emailSettingsSaving, setEmailSettingsSaving] = useState(false);
  const [newSkipDomain, setNewSkipDomain] = useState("");
  const [newAllowEmail, setNewAllowEmail] = useState("");
  const [expandedSettings, setExpandedSettings] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<"settings" | "templates" | "bulk">("settings");
  const [templates, setTemplates] = useState<any[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", subject: "", body: "", category: "general" });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const fetchEmailSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/email-automation/settings");
      if (res.ok) {
        const data = await res.json();
        setEmailSettings({
          auto_reply_enabled: data.auto_reply_enabled ?? true,
          reply_mode: data.reply_mode ?? "replies_and_inquiries",
          skip_marketing: data.skip_marketing ?? true,
          skip_newsletters: data.skip_newsletters ?? true,
          skip_social: data.skip_social ?? true,
          skip_transactional: data.skip_transactional ?? true,
          skip_job_alerts: data.skip_job_alerts ?? true,
          custom_skip_domains: data.custom_skip_domains || [],
          custom_allow_emails: data.custom_allow_emails || [],
          reply_tone: data.reply_tone || "professional",
          max_replies_per_day: data.max_replies_per_day || 50,
          custom_instructions: data.custom_instructions || "",
        });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchEmailSettings(); }, [fetchEmailSettings]);

  const handleSaveEmailSettings = async () => {
    setEmailSettingsSaving(true);
    try {
      const res = await fetch("/api/email-automation/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailSettings),
      });
      if (res.ok) {
        setEmailSettingsSaved(true);
        setTimeout(() => setEmailSettingsSaved(false), 3000);
      }
    } catch { /* ignore */ } finally {
      setEmailSettingsSaving(false);
    }
  };

  // ── Email Templates ──
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/email-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch { /* ignore */ }
  }, []);

  const handleSaveTemplate = async () => {
    try {
      const method = editingTemplate?.id ? "PUT" : "POST";
      const body = editingTemplate?.id
        ? { ...templateForm, id: editingTemplate.id }
        : templateForm;
      const res = await fetch("/api/email-templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditingTemplate(null);
        setTemplateForm({ name: "", subject: "", body: "", category: "general" });
        fetchTemplates();
      }
    } catch { /* ignore */ }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await fetch(`/api/email-templates?id=${id}`, { method: "DELETE" });
      fetchTemplates();
    } catch { /* ignore */ }
  };

  // ── Bulk Campaigns ──
  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/email-campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch { /* ignore */ }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTemplateId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("template_id", selectedTemplateId);
      formData.append("name", `Campaign ${new Date().toLocaleDateString()}`);
      const res = await fetch("/api/email-campaigns", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setUploadResult(data);
        fetchCampaigns();
      } else {
        setUploadResult({ error: data.error });
      }
    } catch (err) {
      setUploadResult({ error: "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleSendCampaign = async (campaignId: number) => {
    setSending(true);
    try {
      const res = await fetch("/api/email-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", campaign_id: campaignId }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchCampaigns();
        setUploadResult(null);
      }
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  // Load templates & campaigns when Gmail settings open
  useEffect(() => {
    if (expandedSettings === "gmail") {
      fetchTemplates();
      fetchCampaigns();
    }
  }, [expandedSettings, fetchTemplates, fetchCampaigns]);

  const copyToClipboard = (text: string, stepIdx: number) => {
    navigator.clipboard.writeText(text.trim()).then(() => {
      setCopiedStep(stepIdx);
      setTimeout(() => setCopiedStep(null), 2000);
    });
  };

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const isConnected = (key: string) =>
    connections.some((c) => c.integration_key === key && c.status === "connected");

  const getConnection = (key: string) =>
    connections.find((c) => c.integration_key === key);

  const openConfigModal = (integration: IntegrationDef) => {
    // Pre-fill form with existing settings if connected
    const existing = getConnection(integration.key);
    const initial: Record<string, string> = {};
    for (const field of integration.configFields) {
      initial[field.key] = (existing?.settings?.[field.key] as string) || "";
    }
    setConfigForm(initial);
    setConfigErrors({});
    setConfigSuccess(false);
    setShowSetupGuide(false);
    setConfigModal(integration);
  };

  const validateForm = (): boolean => {
    if (!configModal) return false;
    const errors: Record<string, string> = {};
    for (const field of configModal.configFields) {
      if (field.required && !configForm[field.key]?.trim()) {
        errors[field.key] = `${field.label} is required`;
      }
      if (field.type === "email" && configForm[field.key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configForm[field.key])) {
        errors[field.key] = "Invalid email format";
      }
      if (field.type === "url" && configForm[field.key] && !/^https?:\/\/.+/.test(configForm[field.key])) {
        errors[field.key] = "Must start with http:// or https://";
      }
    }
    setConfigErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm() || !configModal) return;

    setConnecting(configModal.key);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrationKey: configModal.key,
          settings: { ...configForm, auto_sync: true },
        }),
      });
      if (res.ok) {
        setConfigSuccess(true);
        await fetchConnections();
        setTimeout(() => {
          setConfigModal(null);
          setConfigSuccess(false);
        }, 2000);
      }
    } catch { /* ignore */ } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (key: string) => {
    if (!confirm("Disconnect this integration? Your credentials will be removed.")) return;
    setConnecting(key);
    try {
      await fetch("/api/integrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationKey: key }),
      });
      await fetchConnections();
    } catch { /* ignore */ } finally {
      setConnecting(null);
    }
  };

  const handleTestConnection = async (key: string) => {
    setConnecting(key);
    setTestResult(null);
    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationKey: key }),
      });
      const data = await res.json();
      setTestResult({
        key,
        success: data.success,
        message: data.success ? data.message : data.error,
      });
      // Auto-dismiss after 8 seconds
      setTimeout(() => setTestResult(null), 8000);
    } catch {
      setTestResult({ key, success: false, message: "Network error — could not reach the server" });
    } finally {
      setConnecting(null);
    }
  };

  const filteredIntegrations = INTEGRATION_CATALOG.filter((i) => {
    const matchesCategory = filter === "All" || i.category === filter;
    const matchesSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = connections.filter((c) => c.status === "connected").length;
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const cardBg = isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200";
  const inputCls = `w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors placeholder:text-gray-400 focus:border-primary/50 ${
    isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
  }`;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integrations</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect your tools with real credentials — {connectedCount} of {INTEGRATION_CATALOG.length} active
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <p className="text-2xl font-bold text-green-500">{connectedCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
        </div>
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{INTEGRATION_CATALOG.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
        </div>
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <p className="text-2xl font-bold text-accent"><Shield className="h-6 w-6 inline" /></p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Encrypted Storage</p>
        </div>
        <div className={`rounded-xl p-4 border ${cardBg}`}>
          <p className="text-2xl font-bold text-primary"><RefreshCw className="h-6 w-6 inline" /></p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Real-time Sync</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search integrations..." className={inputCls} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === cat ? "bg-primary text-white" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Test Connection Result Banner */}
      {testResult && (
        <div className={`mb-4 p-4 rounded-xl border flex items-start gap-3 ${
          testResult.success
            ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20"
            : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
        }`}>
          {testResult.success
            ? <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            : <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          }
          <div>
            <p className={`text-sm font-medium ${testResult.success ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
              {testResult.success ? "Connection Verified ✓" : "Connection Failed ✗"}
            </p>
            <p className={`text-xs mt-0.5 ${testResult.success ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}>
              {testResult.message}
            </p>
          </div>
          <button onClick={() => setTestResult(null)} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Integration Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`rounded-2xl p-5 border ${cardBg} animate-pulse`}>
              <div className="h-10 w-10 bg-gray-200 dark:bg-white/10 rounded-xl mb-3" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded mb-2" />
              <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => {
            const connected = isConnected(integration.key);
            const IconComp = integration.icon;
            const isConnecting = connecting === integration.key;
            return (
              <div key={integration.key}
                className={`rounded-2xl p-5 border transition-all hover:shadow-lg ${
                  connected ? "border-green-500/30 bg-green-50/50 dark:bg-green-500/5" : cardBg
                }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${integration.color}18` }}>
                      <IconComp className="h-5 w-5" style={{ color: integration.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        {integration.name}
                        {integration.popular && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">Popular</span>}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{integration.category}</p>
                    </div>
                  </div>
                  {connected && <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium"><Check className="h-3.5 w-3.5" />Active</span>}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{integration.description}</p>

                {/* Show configured fields summary if connected */}
                {connected && getConnection(integration.key)?.settings && (
                  <div className="mb-3 space-y-1">
                    {Object.entries(getConnection(integration.key)!.settings!).filter(([k]) => k !== "auto_sync").map(([key, val]) => {
                      const field = integration.configFields.find(f => f.key === key);
                      if (!field) return null;
                      const isSecret = field!.type === "password";
                      const display = isSecret ? "••••••••" : String(val);
                      return (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400">{field!.label}:</span>
                          <span className="font-mono text-gray-600 dark:text-gray-300 truncate max-w-[140px]">{display}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {connected ? (
                    <>
                      <button onClick={() => openConfigModal(integration)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                        <Settings2 className="h-3.5 w-3.5" />Configure
                      </button>
                      {integration.key === "gmail" && (
                        <button onClick={() => handleTestConnection(integration.key)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors">
                          <Shield className="h-3.5 w-3.5" />Test
                        </button>
                      )}
                      <button onClick={() => handleDisconnect(integration.key)} disabled={isConnecting}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50">
                        {isConnecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => openConfigModal(integration)} disabled={isConnecting}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary hover:bg-primary-600 text-white transition-colors disabled:opacity-50">
                      {isConnecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
                      {isConnecting ? "Connecting..." : "Connect"}
                    </button>
                  )}
                </div>

                {/* ── Per-Integration Settings Button (opens full-screen modal) ── */}
                {connected && (() => {
                  const settingKey = integration.key;
                  const isGmail = settingKey === "gmail";
                  const btnColor = isGmail
                    ? "border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/20"
                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10";
                  const label = isGmail ? "Email Automation Settings" : `${integration.name} Settings`;
                  const icon = isGmail ? <Zap className="h-3.5 w-3.5" /> : <Settings2 className="h-3.5 w-3.5" />;

                  return (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedSettings(settingKey)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors ${btnColor}`}
                      >
                        <span className="flex items-center gap-2">{icon} {label}</span>
                        <Settings2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full-Screen Settings Modal ── */}
      <AnimatePresence>
        {expandedSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md overflow-y-auto"
            onClick={() => setExpandedSettings(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="min-h-screen flex items-start justify-center py-8 px-4"
            >
              <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl ${isDark ? "bg-[#0B1020] border-white/10" : "bg-white border-gray-200"}`}>
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0B1020]/95 backdrop-blur-md rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#6C63FF]/10">
                      <Zap className="w-5 h-5 text-[#6C63FF]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {expandedSettings === "gmail" ? "Email Automation Settings" : `${INTEGRATION_CATALOG.find(i => i.key === expandedSettings)?.name || expandedSettings} Settings`}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {expandedSettings === "gmail"
                          ? "Control which emails get auto-replied and how the AI responds"
                          : "Integration configuration and preferences"}
                      </p>
                    </div>
                  </div>
<button
	                    onClick={() => setExpandedSettings(null)}
	                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
	                  >
	                    <X className="h-5 w-5" />
	                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {expandedSettings === "gmail" ? (
                    <>
                      {/* Tabs */}
                      <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl">
                        {[
                          { id: "settings", label: "Settings", icon: <Settings2 className="h-4 w-4" /> },
                          { id: "templates", label: "Templates", icon: <FileText className="h-4 w-4" /> },
                          { id: "bulk", label: "Bulk Send", icon: <Send className="h-4 w-4" /> },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setSettingsTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              settingsTab === tab.id
                                ? "bg-[#6C63FF] text-white shadow-sm"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {tab.icon} {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* ─── Tab: Settings ─── */}
                      {settingsTab === "settings" && (
                        <div className="space-y-5">
                          {/* Auto-Reply Master Toggle */}
                          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                            <div className="flex-1 mr-4">
                              <p className="text-sm font-semibold text-white">Auto-Reply</p>
                              <p className="text-xs text-gray-400 mt-0.5">Automatically reply to incoming emails with AI</p>
                            </div>
                            <button
                              onClick={() => setEmailSettings(s => ({ ...s, auto_reply_enabled: !s.auto_reply_enabled }))}
                              className="focus:outline-none"
                            >
                              {emailSettings.auto_reply_enabled
                                ? <ToggleRight className="w-12 h-12 text-green-400" />
                                : <ToggleLeft className="w-12 h-12 text-gray-500" />}
                            </button>
                          </div>

                          {emailSettings.auto_reply_enabled && (
                            <div className="space-y-5">
                              {/* Reply Mode */}
                              <div>
                                <p className="text-sm font-semibold text-white mb-1">Reply Mode</p>
                                <p className="text-xs text-gray-400 mb-3">Choose which emails the AI should respond to</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {[
                                    { value: "replies_and_inquiries", label: "🧠 Smart", desc: "Replies + inquiries" },
                                    { value: "replies_only", label: "↩️ Replies Only", desc: "Direct replies" },
                                    { value: "all", label: "📬 All Emails", desc: "Everything" },
                                    { value: "allowlist_only", label: "✅ Allowlist", desc: "Whitelisted only" },
                                  ].map(mode => (
                                    <button key={mode.value}
                                      onClick={() => setEmailSettings(s => ({ ...s, reply_mode: mode.value }))}
                                      className={`p-3 rounded-xl text-left border transition-all ${
                                        emailSettings.reply_mode === mode.value
                                          ? "border-[#6C63FF] bg-[#6C63FF]/10"
                                          : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                                      }`}
                                    >
                                      <span className="text-sm font-medium text-white">{mode.label}</span>
                                      <p className="text-xs text-gray-400 mt-0.5">{mode.desc}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Category Filters */}
                              <div>
                                <p className="text-sm font-semibold text-white mb-1">Skip Categories</p>
                                <p className="text-xs text-gray-400 mb-3">Green = that category is being skipped</p>
                                <div className="space-y-2">
                                  {[
                                    { key: "skip_marketing", label: "📢 Marketing & Promotions", desc: "Amazon, HubSpot, Mailchimp, promotional offers" },
                                    { key: "skip_newsletters", label: "📰 Newsletters & Digests", desc: "Weekly digests, blog updates, curated content" },
                                    { key: "skip_social", label: "👥 Social Notifications", desc: "Facebook, LinkedIn, Twitter, Instagram alerts" },
                                    { key: "skip_transactional", label: "🧾 Transactional", desc: "Receipts, shipping updates, account alerts" },
                                    { key: "skip_job_alerts", label: "💼 Job Alerts & Career", desc: "Indeed, Naukri, AngelList, Glassdoor" },
                                  ].map(cat => (
                                    <div key={cat.key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] transition-colors">
                                      <div className="flex-1 mr-4">
                                        <span className="text-sm font-medium text-white">{cat.label}</span>
                                        <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                                      </div>
                                      <button
                                        onClick={() => setEmailSettings(s => ({ ...s, [cat.key]: !(s as any)[cat.key] }))}
                                        className="focus:outline-none"
                                      >
                                        {(emailSettings as any)[cat.key]
                                          ? <ToggleRight className="w-10 h-10 text-green-400" />
                                          : <ToggleLeft className="w-10 h-10 text-gray-500" />}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* AI Tone */}
                              <div>
                                <p className="text-sm font-semibold text-white mb-1">AI Tone</p>
                                <p className="text-xs text-gray-400 mb-3">How the AI sounds when replying to emails</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {[
                                    { value: "professional", label: "👔 Professional", desc: "Business-appropriate" },
                                    { value: "friendly", label: "😊 Friendly", desc: "Warm & approachable" },
                                    { value: "casual", label: "🤙 Casual", desc: "Conversational" },
                                    { value: "formal", label: "📜 Formal", desc: "Corporate B2B" },
                                  ].map(tone => (
                                    <button key={tone.value}
                                      onClick={() => setEmailSettings(s => ({ ...s, reply_tone: tone.value }))}
                                      className={`p-3 rounded-xl text-left border transition-all ${
                                        emailSettings.reply_tone === tone.value
                                          ? "border-[#6C63FF] bg-[#6C63FF]/10"
                                          : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                                      }`}
                                    >
                                      <span className="text-sm font-medium text-white">{tone.label}</span>
                                      <p className="text-xs text-gray-400 mt-0.5">{tone.desc}</p>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Max Replies */}
                              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <p className="text-sm font-semibold text-white">Max Replies / Day</p>
                                    <p className="text-xs text-gray-400">Safety limit to prevent over-sending</p>
                                  </div>
                                  <span className="text-xl font-bold text-[#6C63FF]">{emailSettings.max_replies_per_day}</span>
                                </div>
                                <input type="range" min={5} max={200}
                                  value={emailSettings.max_replies_per_day}
                                  onChange={e => setEmailSettings(s => ({ ...s, max_replies_per_day: parseInt(e.target.value) }))}
                                  className="w-full accent-[#6C63FF] h-2"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1"><span>5</span><span>200</span></div>
                              </div>

                              {/* Custom Instructions — bigger textarea */}
                              <div>
                                <p className="text-sm font-semibold text-white mb-1">Custom Instructions</p>
                                <p className="text-xs text-gray-400 mb-3">Extra guidance for the AI when generating replies</p>
                                <textarea
                                  value={emailSettings.custom_instructions || ""}
                                  onChange={e => setEmailSettings(s => ({ ...s, custom_instructions: e.target.value }))}
                                  placeholder="e.g. Always mention our 14-day free trial. Focus on small businesses. Keep responses concise."
                                  rows={6}
                                  className="w-full px-4 py-3.5 rounded-xl text-sm border border-white/10 bg-[#0f172a] focus:border-[#6C63FF] focus:outline-none resize-none placeholder-gray-600 min-h-[140px]"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ─── Tab: Templates ─── */}
                      {settingsTab === "templates" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-base font-semibold">Email Templates</h3>
                              <p className="text-sm text-gray-400">Create reusable templates with {"{{variable}}"} placeholders</p>
                            </div>
                            <button
                              onClick={() => {
                                setEditingTemplate({ id: null });
                                setTemplateForm({ name: "", subject: "", body: "", category: "general" });
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#6C63FF] hover:bg-[#5B54E6] text-white transition-colors"
                            >
                              <Plus className="h-4 w-4" /> New Template
                            </button>
                          </div>

                          {/* Template Editor */}
                          {editingTemplate && (
                            <div className="p-5 rounded-xl border border-[#6C63FF]/30 bg-[#6C63FF]/5 space-y-4">
                              <input
                                type="text"
                                placeholder="Template name (e.g. Follow-Up)"
                                value={templateForm.name}
                                onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm border border-white/10 bg-[#0f172a] focus:border-[#6C63FF] focus:outline-none placeholder-gray-600"
                              />
                              <input
                                type="text"
                                placeholder='Subject line (e.g. Great to meet you, {{name}}!)'
                                value={templateForm.subject}
                                onChange={e => setTemplateForm(f => ({ ...f, subject: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl text-sm border border-white/10 bg-[#0f172a] focus:border-[#6C63FF] focus:outline-none placeholder-gray-600"
                              />
                              <textarea
                                placeholder={'Email body — use {{name}}, {{company}}, {{sender_name}}, etc.\n\nHi {{name}},\n\nThanks for your interest...'}
                                value={templateForm.body}
                                onChange={e => setTemplateForm(f => ({ ...f, body: e.target.value }))}
                                rows={8}
                                className="w-full px-4 py-3 rounded-xl text-sm border border-white/10 bg-[#0f172a] focus:border-[#6C63FF] focus:outline-none resize-none placeholder-gray-600 font-mono min-h-[180px]"
                              />
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border border-white/10 bg-[#0f172a] text-white hover:border-white/20 transition-colors"
                                  >
                                    <span>{templateForm.category === "follow-up" ? "Follow-Up" : templateForm.category === "confirmation" ? "Confirmation" : templateForm.category === "pricing" ? "Pricing" : templateForm.category === "re-engagement" ? "Re-Engagement" : "General"}</span>
                                    <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
                                  </button>
                                  {categoryDropdownOpen && (
                                    <div className="absolute z-50 mt-1 py-1 w-40 rounded-lg border border-white/10 bg-[#0f172a] shadow-xl">
                                      {[
                                        { value: "general", label: "General" },
                                        { value: "follow-up", label: "Follow-Up" },
                                        { value: "confirmation", label: "Confirmation" },
                                        { value: "pricing", label: "Pricing" },
                                        { value: "re-engagement", label: "Re-Engagement" },
                                      ].map(opt => (
                                        <button
                                          key={opt.value}
                                          type="button"
                                          onClick={() => { setTemplateForm(f => ({ ...f, category: opt.value })); setCategoryDropdownOpen(false); }}
                                          className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${
                                            templateForm.category === opt.value ? "text-[#6C63FF] bg-[#6C63FF]/10" : "text-gray-300"
                                          }`}
                                        >
                                          {opt.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1" />
                                <button
                                  onClick={() => { setEditingTemplate(null); setTemplateForm({ name: "", subject: "", body: "", category: "general" }); }}
                                  className="px-4 py-2 rounded-lg text-sm font-medium border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveTemplate}
                                  disabled={!templateForm.name || !templateForm.subject || !templateForm.body}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#6C63FF] hover:bg-[#5B54E6] text-white transition-colors disabled:opacity-40"
                                >
                                  <Save className="h-4 w-4" /> Save Template
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Template List */}
                          {templates.length === 0 && !editingTemplate && (
                            <div className="text-center py-12 text-gray-500">
                              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                              <p>No templates yet. Create one to get started!</p>
                            </div>
                          )}
                          <div className="space-y-3">
                            {templates.map((t: any) => (
                              <div key={t.id} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/20 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold">{t.name}</span>
                                      {t.is_default && (
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-[#6C63FF]/20 text-[#6C63FF]">Default</span>
                                      )}
                                      <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-gray-400 capitalize">{t.category}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-1">{t.subject}</p>
                                    <p className="text-xs text-gray-500 line-clamp-2">{t.body}</p>
                                    {t.variables?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {t.variables.map((v: string) => (
                                          <span key={v} className="px-2 py-0.5 rounded text-xs bg-[#6C63FF]/10 text-[#6C63FF]/80 font-mono">{`{{${v}}}`}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 ml-3">
                                    <button
                                      onClick={() => {
                                        setEditingTemplate(t);
                                        setTemplateForm({ name: t.name, subject: t.subject, body: t.body, category: t.category });
                                      }}
                                      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                    >
                                      <Settings2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTemplate(t.id)}
                                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ─── Tab: Bulk Send ─── */}
                      {settingsTab === "bulk" && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-base font-semibold">Bulk Email Send</h3>
                            <p className="text-sm text-gray-400">Upload an Excel/CSV file with contacts and send personalized emails</p>
                          </div>

                          {/* Step 1: Choose Template */}
                          <section className="p-5 rounded-xl border border-white/10 bg-white/5">
                            <h4 className="text-sm font-semibold mb-3">Step 1 — Choose a Template</h4>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                                className="w-full px-4 py-3 rounded-lg text-sm border border-white/10 bg-[#0B1020] text-left flex items-center justify-between hover:border-[#6C63FF]/50 transition-colors"
                              >
                                <span className={selectedTemplateId ? "text-white" : "text-gray-500"}>
                                  {selectedTemplateId
                                    ? (templates.find((t: any) => String(t.id) === selectedTemplateId)?.name || "Select...")
                                    : "Select a template..."}
                                </span>
                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${templateDropdownOpen ? "rotate-180" : ""}`} />
                              </button>
                              {templateDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-[#131B2E] shadow-xl max-h-60 overflow-y-auto">
                                  {templates.length === 0 && (
                                    <div className="px-4 py-3 text-sm text-gray-500">No templates yet. Create one in the Templates tab.</div>
                                  )}
                                  {templates.map((t: any) => (
                                    <button
                                      key={t.id}
                                      type="button"
                                      onClick={() => { setSelectedTemplateId(String(t.id)); setTemplateDropdownOpen(false); }}
                                      className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                                        String(t.id) === selectedTemplateId ? "bg-[#6C63FF]/10 text-[#6C63FF]" : "text-white"
                                      }`}
                                    >
                                      <div className="text-sm font-medium">{t.name}</div>
                                      <div className="text-xs text-gray-400 mt-0.5 truncate">{t.subject}</div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {selectedTemplateId && (() => {
                              const t = templates.find((t: any) => String(t.id) === selectedTemplateId);
                              return t ? (
                                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                  <p className="text-xs text-gray-400 mb-1">Variables in this template:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {t.variables?.map((v: string) => (
                                      <span key={v} className="px-2 py-0.5 rounded text-xs bg-[#6C63FF]/10 text-[#6C63FF]/80 font-mono">{`{{${v}}}`}</span>
                                    ))}
                                    <span className="text-xs text-gray-500">— make sure your Excel has matching column headers</span>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </section>

                          {/* Step 2: Upload File */}
                          <section className="p-5 rounded-xl border border-white/10 bg-white/5">
                            <h4 className="text-sm font-semibold mb-2 text-gray-300">Step 2 — Upload Contacts (Excel or CSV)</h4>
                            <p className="text-xs text-gray-500 mb-4">
                              File must have a column header called <code className="px-1 py-0.5 rounded bg-[#6C63FF]/10 text-[#6C63FF]">email</code>.
                              Other columns (name, company, phone) become template variables.
                            </p>
                            <div
                              className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all ${
                                selectedTemplateId
                                  ? "border-white/20 hover:border-[#6C63FF]/50 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer"
                                  : "border-white/5 opacity-40 cursor-not-allowed"
                              }`}
                              onClick={() => {
                                if (!selectedTemplateId) return;
                                const input = document.getElementById("bulk-file-input") as HTMLInputElement;
                                input?.click();
                              }}
                            >
                              <Upload className="w-10 h-10 text-gray-500 mb-3" />
                              <span className="text-sm font-medium text-gray-300 mb-1">
                                {uploading ? "Processing file..." : "Click to upload"}
                              </span>
                              <span className="text-xs text-gray-500">.xlsx, .xls, or .csv files supported</span>
                              <input
                                id="bulk-file-input"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                disabled={!selectedTemplateId || uploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                style={{ pointerEvents: selectedTemplateId ? "auto" : "none" }}
                              />
                            </div>
                          </section>

                          {/* Upload Result Preview */}
                          {uploadResult && !uploadResult.error && (
                            <section className="p-5 rounded-xl border border-green-500/30 bg-green-500/5">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-green-400">
                                  ✓ {uploadResult.contactsCount} contacts found
                                </h4>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setUploadResult(null)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSendCampaign(uploadResult.campaign.id)}
                                    disabled={sending}
                                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
                                  >
                                    {sending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                    {sending ? "Sending..." : "Send All Emails"}
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400">
                                Campaign "{uploadResult.campaign.name}" is ready. Each contact will receive a personalized email using the selected template.
                              </p>
                            </section>
                          )}
                          {uploadResult?.error && (
                            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                              <p className="text-sm text-red-400">{uploadResult.error}</p>
                            </div>
                          )}

                          {/* Previous Campaigns */}
                          {campaigns.length > 0 && (
                            <section>
                              <h4 className="text-sm font-semibold mb-3">Previous Campaigns</h4>
                              <div className="space-y-2">
                                {campaigns.map((c: any) => (
                                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                                    <div>
                                      <span className="text-sm font-medium">{c.name}</span>
                                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                        c.status === "completed" ? "bg-green-500/20 text-green-400"
                                          : c.status === "sending" ? "bg-yellow-500/20 text-yellow-400"
                                          : "bg-white/10 text-gray-400"
                                      }`}>{c.status}</span>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {c.sent_count || 0} sent / {c.total_recipients} total
                                        {c.failed_count > 0 && ` · ${c.failed_count} failed`}
                                      </p>
                                    </div>
                                    {c.status === "draft" && (
                                      <button
                                        onClick={() => handleSendCampaign(c.id)}
                                        disabled={sending}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#6C63FF] hover:bg-[#5B54E6] text-white transition-colors disabled:opacity-50"
                                      >
                                        <Send className="h-3.5 w-3.5" /> Send
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Placeholder for non-Gmail integrations */
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-4 rounded-2xl bg-white/5 mb-4">
                        <Settings2 className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{INTEGRATION_CATALOG.find(i => i.key === expandedSettings)?.name || expandedSettings} Settings</h3>
                      <p className="text-sm text-gray-400 max-w-md">
                        Advanced settings for this integration — including auto-reply templates, notification preferences, 
                        and workflow rules — will be available here once the integration is fully configured.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer with Cancel + Save */}
                {expandedSettings === "gmail" && (
                  <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0B1020]/95 backdrop-blur-md rounded-b-2xl">
                    <button
                      onClick={() => setExpandedSettings(null)}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
<button
	                      onClick={async () => {
	                        await handleSaveEmailSettings();
	                        setExpandedSettings(null);
	                      }}
	                      disabled={emailSettingsSaving}
	                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-[#6C63FF] hover:bg-[#5B54E6] text-white transition-colors disabled:opacity-50"
	                    >
	                      {emailSettingsSaving ? <RefreshCw className="h-4 w-4 animate-spin" />
	                        : <><Save className="h-4 w-4" /> Save Settings</>}
	                    </button>
                  </div>
                )}
                {expandedSettings !== "gmail" && (
                  <div className="sticky bottom-0 flex items-center justify-end px-6 py-4 border-t border-white/10 bg-[#0B1020]/95 backdrop-blur-md rounded-b-2xl">
                    <button
                      onClick={() => setExpandedSettings(null)}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Configuration Modal ── */}
      <AnimatePresence>
        {configModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => { if (!connecting) setConfigModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl border shadow-xl ${isDark ? "bg-[#0f1729] border-white/10" : "bg-white border-gray-200"}`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${configModal.color}18` }}>
                    <configModal.icon className="h-5 w-5" style={{ color: configModal.color }} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">
                      {isConnected(configModal.key) ? "Configure" : "Connect"} {configModal.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{configModal.category}</p>
                  </div>
                </div>
                <button onClick={() => setConfigModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                {configModal.connectNote && !configSuccess && !showSetupGuide && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{configModal.connectNote}</p>
                      {configModal.setupSteps && configModal.setupSteps.length > 0 && (
                        <button onClick={() => setShowSetupGuide(true)}
                          className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          <ExternalLink className="h-3 w-3" />
                          View step-by-step setup guide
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Setup Guide (expandable) ── */}
                {showSetupGuide && configModal.setupSteps && !configSuccess && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        Setup Guide — {configModal.name}
                      </h3>
                      <button onClick={() => setShowSetupGuide(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        Back to form
                      </button>
                    </div>

                    {/* Whitespace warning */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                        <strong>Tip:</strong> Use the copy button on each URL below to avoid whitespace errors. Do not type or paste URLs manually — even a trailing space will cause "Invalid redirect: Cannot contain whitespace" in Google Cloud Console.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {configModal.setupSteps.map((step, i) => {
                        // Detect URLs in the detail text to make them copyable
                        const urlRegex = /(https?:\/\/[^\s.,;:!?)\]]+)/g;
                        const parts = step.detail.split(urlRegex);
                        return (
                          <div key={i}
                            className={`rounded-xl border p-4 transition-colors ${
                              isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
                            }`}>
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{step.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                  {parts.map((part, pi) => {
                                    if (urlRegex.test(part) || /^https?:\/\//.test(part)) {
                                      // Reset regex lastIndex
                                      return (
                                        <span key={pi} className="inline-flex items-center gap-1 align-middle">
                                          <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-mono break-all">{part}</code>
                                          <button onClick={() => copyToClipboard(part, i * 100 + pi)}
                                            className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-primary/20 transition-colors shrink-0"
                                            title="Copy URL">
                                            {copiedStep === i * 100 + pi
                                              ? <CheckCircle2 className="h-3 w-3 text-green-500" />
                                              : <Copy className="h-3 w-3 text-primary" />}
                                          </button>
                                        </span>
                                      );
                                    }
                                    return <span key={pi}>{part}</span>;
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {configModal.helpUrl && (
                      <a href={configModal.helpUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-2">
                        <ExternalLink className="h-3 w-3" />
                        Open {configModal.name} console
                      </a>
                    )}
                    <button onClick={() => setShowSetupGuide(false)}
                      className="w-full py-2.5 rounded-xl text-sm font-medium bg-primary hover:bg-primary-600 text-white transition-colors mt-2">
                      I have my credentials — Continue to form
                    </button>
                  </div>
                )}

                {!showSetupGuide && configSuccess && (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">Successfully Connected!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{configModal.name} is now active and syncing.</p>
                  </div>
                )}

                {!showSetupGuide && !configSuccess && (
                  <div className="space-y-4">
                    {configModal.configFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                        <div className="relative">
                          {field.type === "select" ? (
                            <select value={configForm[field.key] || ""} onChange={(e) => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                              className={inputCls + (configErrors[field.key] ? " !border-red-500" : "")}>
                              <option value="" className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white">{field.placeholder}</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-white text-gray-900 dark:bg-[#1a1a2e] dark:text-white">{opt.label}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type === "password" && !showSecrets[field.key] ? "password" : field.type === "password" ? "text" : field.type}
                              value={configForm[field.key] || ""}
                              onChange={(e) => { setConfigForm({ ...configForm, [field.key]: e.target.value }); setConfigErrors({ ...configErrors, [field.key]: "" }); }}
                              placeholder={field.placeholder}
                              className={inputCls + (configErrors[field.key] ? " !border-red-500" : "") + (field.type === "password" ? " pr-10" : "")}
                            />
                          )}
                          {field.type === "password" && (
                            <button type="button" onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !showSecrets[field.key] })}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                              {showSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                        {configErrors[field.key] && (
                          <p className="text-xs text-red-500 mt-1">{configErrors[field.key]}</p>
                        )}
                        {field.helpText && !configErrors[field.key] && (
                          <p className="text-xs text-gray-400 mt-1">{field.helpText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {!configSuccess && !showSetupGuide && (
                <div className="flex items-center justify-between p-5 border-t border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    {configModal.setupSteps && configModal.setupSteps.length > 0 && (
                      <button onClick={() => setShowSetupGuide(true)}
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                        <BookOpen className="h-3 w-3" />
                        Setup guide
                      </button>
                    )}
                    {configModal.helpUrl && (
                      <a href={configModal.helpUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" />
                        Get credentials
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <button onClick={() => setConfigModal(null)} disabled={!!connecting}
                      className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleConnect} disabled={!!connecting}
                      className="px-5 py-2 rounded-lg text-sm font-medium bg-primary hover:bg-primary-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2">
                      {connecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
                      {connecting ? "Connecting..." : isConnected(configModal.key) ? "Update" : "Connect"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}