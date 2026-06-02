import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Users
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        image_url TEXT,
        provider VARCHAR(50) DEFAULT 'credentials',
        provider_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Leads
    await query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        source VARCHAR(100) DEFAULT 'manual',
        status VARCHAR(50) DEFAULT 'new',
        notes TEXT,
        last_contacted TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Appointments
    await query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        scheduled_at TIMESTAMPTZ NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        meeting_type VARCHAR(100) DEFAULT 'demo',
        status VARCHAR(50) DEFAULT 'scheduled',
        meeting_link TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Conversations
    await query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
        channel VARCHAR(50) DEFAULT 'email',
        status VARCHAR(50) DEFAULT 'active',
        last_message TEXT,
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Conversation messages
    await query(`
      CREATE TABLE IF NOT EXISTS conversation_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Notifications
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        action_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // User integrations
    await query(`
      CREATE TABLE IF NOT EXISTS user_integrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        integration_key VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'disconnected',
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, integration_key)
      )
    `);

    // Email automation settings
    await query(`
      CREATE TABLE IF NOT EXISTS email_automation_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        auto_reply_enabled BOOLEAN DEFAULT TRUE,
        reply_mode VARCHAR(50) DEFAULT 'replies_and_inquiries',
        skip_marketing BOOLEAN DEFAULT TRUE,
        skip_newsletters BOOLEAN DEFAULT TRUE,
        skip_social BOOLEAN DEFAULT TRUE,
        skip_transactional BOOLEAN DEFAULT TRUE,
        skip_job_alerts BOOLEAN DEFAULT TRUE,
        custom_skip_domains TEXT[] DEFAULT '{}',
        custom_allow_emails TEXT[] DEFAULT '{}',
        reply_tone VARCHAR(50) DEFAULT 'professional',
        reply_language VARCHAR(10) DEFAULT 'en',
        max_replies_per_day INTEGER DEFAULT 50,
        custom_instructions TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Email logs
    await query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        recipient VARCHAR(255) NOT NULL,
        subject TEXT NOT NULL,
        body TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        provider VARCHAR(50),
        error TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Email templates
    await query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        variables TEXT[] DEFAULT '{}',
        is_default BOOLEAN DEFAULT FALSE,
        category VARCHAR(100) DEFAULT 'general',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Email campaigns (bulk sends)
    await query(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        template_id INTEGER REFERENCES email_templates(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        total_recipients INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        opened_count INTEGER DEFAULT 0,
        replied_count INTEGER DEFAULT 0,
        contacts JSONB DEFAULT '[]',
        variable_overrides JSONB DEFAULT '{}',
        scheduled_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Seed Google OAuth user if not exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      "pawanputra779@gmail.com",
    ]);
    if (existingUser.rows.length === 0) {
      await query(
        `INSERT INTO users (name, email, provider, provider_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        ["Pawan Kumar Paik", "pawanputra779@gmail.com", "google", "google-123"]
      );
    }

    // Seed default email automation settings for user 1
    const existingSettings = await query("SELECT id FROM email_automation_settings WHERE user_id = 1");
    if (existingSettings.rows.length === 0) {
      await query(`INSERT INTO email_automation_settings (user_id) VALUES (1)`);
    }

    // Seed default email templates for user 1
    const existingTemplates = await query("SELECT id FROM email_templates WHERE user_id = 1");
    if (existingTemplates.rows.length === 0) {
      await query(`
        INSERT INTO email_templates (user_id, name, subject, body, variables, is_default, category) VALUES
        (1, 'Welcome Follow-Up', 'Great to meet you, {{name}}!', 'Hi {{name}},\n\nIt was great connecting with you! I wanted to follow up and share some information about AI Appointment Setter.\n\nOur platform helps businesses like {{company}} automate lead follow-ups and book meetings on autopilot.\n\nWould you be interested in a quick demo? You can book one here: {{book_demo_url}}\n\nBest regards,\n{{sender_name}}', ARRAY['name','company','book_demo_url','sender_name'], true, 'follow-up'),
        (1, 'Demo Booking Confirmation', 'Your Demo is Confirmed — {{date}}', 'Hi {{name}},\n\nYour demo of AI Appointment Setter is confirmed for {{date}} at {{time}}.\n\nDuring the call, we''ll cover:\n• How AI automates your lead follow-ups\n• Smart scheduling that books meetings 24/7\n• ROI you can expect for {{company}}\n\nIf you need to reschedule, just reply to this email.\n\nLooking forward to it!\n{{sender_name}}', ARRAY['name','date','time','company','sender_name'], false, 'confirmation'),
        (1, 'Pricing Inquiry Response', 'AI Appointment Setter Pricing', 'Hi {{name}},\n\nThanks for your interest in AI Appointment Setter! Here''s a quick overview of our plans:\n\n🚀 Starter — $49/mo: Up to 500 leads, email automation, basic AI replies\n💼 Professional — $149/mo: Up to 5,000 leads, advanced AI, calendar integration\n🏢 Enterprise — $299/mo: Unlimited leads, custom AI training, priority support\n\nAll plans include a 14-day free trial. Would you like to start your trial?\n\nBest,\n{{sender_name}}', ARRAY['name','sender_name'], false, 'pricing'),
        (1, 'Re-Engagement', 'Still interested in automating your appointments?', 'Hi {{name}},\n\nI noticed we haven''t connected yet about automating your appointment setting. Just wanted to check in!\n\nBusinesses using AI Appointment Setter typically see:\n• 3x more meetings booked\n• 80% reduction in manual follow-ups\n• 40% higher lead conversion\n\nWould a 15-minute demo work for you this week?\n\nCheers,\n{{sender_name}}', ARRAY['name','sender_name'], false, 're-engagement')
      `);
    }

    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("DB init error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}