import {
  MessageSquare,
  Users,
  Mail,
  Calendar,
  Link2,
  BarChart3,
  Radio,
  UserCheck,
  GitBranch,
  Bell,
  Building2,
  Briefcase,
  Stethoscope,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/* ============================
   NAVIGATION
   ============================ */
export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
];

/* ============================
   TRUST STATS
   ============================ */
export const TRUST_STATS = [
  { value: 500, suffix: "+", label: "Businesses Automated", prefix: "" },
  { value: 3, suffix: "×", label: "Higher Conversion Rates", prefix: "" },
  { value: 24, suffix: "/7", label: "AI Follow-Up", prefix: "" },
  { value: 10000, suffix: "+", label: "Appointments Booked", prefix: "" },
];

/* ============================
   PROBLEMS
   ============================ */
export const PROBLEMS = [
  { title: "Leads Go Cold", description: "Without immediate follow-up, 78% of leads lose interest within 5 minutes." },
  { title: "Slow Responses", description: "Average response time is 47 hours — leads have already moved on." },
  { title: "Missed Follow-ups", description: "80% of sales require 5+ follow-ups, but 44% of reps give up after one." },
  { title: "Low Conversion", description: "Only 2% of cold leads convert without persistent, timely outreach." },
  { title: "Manual Chaos", description: "Juggling calendars, CRM updates, and follow-ups manually wastes hours daily." },
];

/* ============================
   SOLUTIONS
   ============================ */
export const SOLUTIONS = [
  { title: "Instant AI Replies", description: "AI responds to every inquiry in under 12 seconds — 24/7, no delays." },
  { title: "Automated Reminders", description: "Smart follow-up sequences keep leads warm and moving through your pipeline." },
  { title: "Lead Qualification", description: "AI asks the right questions to qualify leads before they reach your calendar." },
  { title: "Auto Scheduling", description: "Qualified leads book meetings directly into your calendar — no back-and-forth." },
  { title: "CRM Syncing", description: "Every interaction, booking, and note syncs to your CRM automatically." },
];

/* ============================
   FEATURES
   ============================ */
export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Conversational AI that engages, qualifies, and books meetings automatically.",
  },
  {
    icon: Users,
    title: "Smart Lead Qualification",
    description: "AI asks targeted questions to score and prioritize your best leads.",
  },
  {
    icon: Mail,
    title: "Email + SMS Follow-ups",
    description: "Automated multi-channel sequences that keep leads engaged until they convert.",
  },
  {
    icon: Calendar,
    title: "Calendar Booking",
    description: "Seamless scheduling that books directly into Google Calendar or Outlook.",
  },
  {
    icon: Link2,
    title: "CRM Integration",
    description: "Sync with HubSpot, Salesforce, and 20+ CRMs — zero manual data entry.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights on response times, conversion rates, and pipeline health.",
  },
  {
    icon: Radio,
    title: "Multi-channel Communication",
    description: "Reach leads on email, SMS, WhatsApp, and web chat from one platform.",
  },
  {
    icon: UserCheck,
    title: "Human Handoff",
    description: "Seamlessly transfer complex conversations to your team when AI hits its limit.",
  },
  {
    icon: GitBranch,
    title: "Pipeline Tracking",
    description: "Visual pipeline that shows every lead's journey from inquiry to booked meeting.",
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    description: "Reduce no-shows by 35% with smart pre-meeting reminders and confirmations.",
  },
];

/* ============================
   AI WORKFLOW STEPS
   ============================ */
export const WORKFLOW_STEPS = [
  { step: 1, title: "Lead Submits Inquiry", description: "A potential customer fills out a form, sends an email, or messages you." },
  { step: 2, title: "AI Replies Instantly", description: "Our AI responds in under 12 seconds with a personalized message." },
  { step: 3, title: "AI Qualifies the Lead", description: "Intelligent questions determine if the lead is a good fit." },
  { step: 4, title: "AI Books the Meeting", description: "Qualified leads schedule directly into your calendar." },
  { step: 5, title: "CRM Updates Automatically", description: "Every detail is logged — no manual data entry needed." },
];

/* ============================
   CHAT DEMO MESSAGES
   ============================ */
export const CHAT_DEMO_MESSAGES = [
  { sender: "lead" as const, text: "Hi, I'm interested in your services. Can I book a call?" },
  { sender: "ai" as const, text: "Hi there! 👋 I'd love to help you schedule a call. What time works best for you — mornings or afternoons?" },
  { sender: "lead" as const, text: "Mornings are great, preferably around 10 AM." },
  { sender: "ai" as const, text: "I have Tuesday at 10 AM or Wednesday at 10:30 AM available. Which works better for you?" },
  { sender: "lead" as const, text: "Tuesday at 10 AM sounds perfect!" },
  { sender: "ai" as const, text: "✅ Meeting booked! Tuesday at 10 AM. You'll receive a calendar invite and a reminder 1 hour before. Looking forward to it!" },
];

/* ============================
   USE CASES
   ============================ */
export interface UseCase {
  icon: LucideIcon;
  industry: string;
  benefits: string[];
  cta: string;
}

export const USE_CASES: UseCase[] = [
  {
    icon: Building2,
    industry: "Real Estate",
    benefits: ["Qualify buyers automatically", "Schedule property tours", "Automate buyer follow-ups"],
    cta: "See How It Works",
  },
  {
    icon: Briefcase,
    industry: "Agencies",
    benefits: ["Book discovery calls", "Qualify client leads", "Reduce no-shows by 35%"],
    cta: "See How It Works",
  },
  {
    icon: TrendingUp,
    industry: "Consultants",
    benefits: ["Automate consultation bookings", "Nurture warm leads", "Save 10+ hours per week"],
    cta: "See How It Works",
  },
  {
    icon: Stethoscope,
    industry: "Clinics",
    benefits: ["Patient appointment automation", "Automated reminders", "Intake qualification"],
    cta: "See How It Works",
  },
];

/* ============================
   INTEGRATIONS
   ============================ */
export const INTEGRATIONS = [
  { name: "Google Calendar", color: "#4285F4", icon: "googlecalendar" },
  { name: "Outlook", color: "#0078D4", icon: "outlook" },
  { name: "Gmail", color: "#EA4335", icon: "gmail" },
  { name: "Slack", color: "#4A154B", icon: "slack" },
  { name: "WhatsApp", color: "#25D366", icon: "whatsapp" },
  { name: "Zoom", color: "#2D8CFF", icon: "zoom" },
  { name: "Stripe", color: "#635BFF", icon: "stripe" },
  { name: "HubSpot", color: "#FF7A59", icon: "hubspot" },
  { name: "Salesforce", color: "#00A1E0", icon: "salesforce" },
  { name: "Calendly", color: "#006BFF", icon: "calendly" },
  { name: "Notion", color: "#000000", icon: "notion" },
  { name: "Trello", color: "#0079BF", icon: "trello" },
  { name: "Discord", color: "#5865F2", icon: "discord" },
  { name: "Shopify", color: "#95BF47", icon: "shopify" },
  { name: "Microsoft Teams", color: "#5059C9", icon: "teams" },
];

/* ============================
   PRICING
   ============================ */
export interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    description: "For small businesses getting started",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: ["500 AI conversations/mo", "Email automation", "Basic analytics", "1 calendar integration", "Email support"],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    description: "For growing teams that need more",
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: ["Unlimited conversations", "CRM integrations", "SMS follow-ups", "Advanced workflows", "Multi-calendar support", "Priority support"],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: 299,
    yearlyPrice: 249,
    features: ["Custom AI workflows", "Dedicated account manager", "API access", "White-label solution", "SLA guarantee", "Custom integrations"],
    highlighted: false,
    cta: "Contact Sales",
  },
];

/* ============================
   TESTIMONIALS
   ============================ */
export interface Testimonial {
  name: string;
  company: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sarah Chen",
    company: "BlueSky Realty",
    role: "Sales Director",
    quote: "We increased booked appointments by 42% in the first month. The AI handles qualifying leads so our team focuses on closing deals.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    company: "GrowthLab Agency",
    role: "CEO",
    quote: "Our response time went from 4 hours to 12 seconds. The difference in lead conversion is remarkable — we'll never go back.",
    rating: 5,
    avatar: "MJ",
  },
  {
    name: "Dr. Emily Rivera",
    company: "CareWell Clinics",
    role: "Operations Manager",
    quote: "No-shows dropped by 35% with automated reminders. Our front desk staff saves hours every week on scheduling calls.",
    rating: 5,
    avatar: "ER",
  },
  {
    name: "David Park",
    company: "Apex Consulting",
    role: "Managing Partner",
    quote: "I was skeptical about AI booking, but it's booked over 200 qualified meetings for us this quarter. ROI is incredible.",
    rating: 5,
    avatar: "DP",
  },
];

/* ============================
   FAQ
   ============================ */
export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does the AI appointment setter work?",
    answer: "Our AI engages leads through your website chat, email, and SMS. It responds instantly, asks qualifying questions, and books meetings directly into your calendar — all on autopilot. When a lead needs human attention, it seamlessly hands off to your team.",
  },
  {
    question: "Does it integrate with my existing CRM?",
    answer: "Yes! We integrate with HubSpot, Salesforce, Pipedrive, Zoho, and 20+ CRMs. Every conversation, booking, and lead detail syncs automatically — no manual data entry.",
  },
  {
    question: "Can humans take over conversations?",
    answer: "Absolutely. The Human Handoff feature lets your team jump into any conversation instantly. The AI provides full context so your reps can pick up right where the AI left off.",
  },
  {
    question: "Does it support both SMS and email?",
    answer: "Yes — our multi-channel system handles email, SMS, WhatsApp, and web chat. You can set up automated sequences across all channels to maximize reach and engagement.",
  },
  {
    question: "Is setup difficult?",
    answer: "Not at all. Most businesses are up and running within 30 minutes. Connect your calendar, set up your qualifying questions, and the AI starts working. Our onboarding team helps with custom configurations.",
  },
  {
    question: "Can I customize the AI workflows?",
    answer: "Yes. You have full control over qualifying questions, response templates, follow-up timing, scheduling rules, and escalation triggers. Enterprise plans include custom AI training on your brand voice.",
  },
];

/* ============================
   FOOTER
   ============================ */
export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
    { label: "Use Cases", href: "#use-cases" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/book-demo" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

/* ============================
   ROI CALCULATOR DEFAULTS
   ============================ */
export const ROI_DEFAULTS = {
  leadsPerMonth: 200,
  currentConversionRate: 8,
  averageDealValue: 500,
  monthlyCost: 99,
};

/* ============================
   CHAT WIDGET MESSAGES
   ============================ */
export const CHAT_WIDGET_MESSAGES = [
  { sender: "bot" as const, text: "👋 Hi! I'm the AI Appointment Setter assistant. Want to see how we can help you book more meetings?" },
  { sender: "bot" as const, text: "Just type a message to start a conversation, or click 'Book a Demo' to schedule a call!" },
];