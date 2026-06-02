import { query } from "@/lib/db";

let schemaInitialized = false;

export async function initDb() {
  if (schemaInitialized) return;
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      plan VARCHAR(50) DEFAULT 'starter',
      email_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      company VARCHAR(255),
      source VARCHAR(100) DEFAULT 'manual',
      status VARCHAR(50) DEFAULT 'new',
      notes TEXT,
      last_contacted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      meeting_type VARCHAR(50) DEFAULT 'video',
      meeting_link VARCHAR(500),
      scheduled_at TIMESTAMP NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      status VARCHAR(50) DEFAULT 'scheduled',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      channel VARCHAR(50) DEFAULT 'ai_chat',
      messages JSONB DEFAULT '[]',
      status VARCHAR(50) DEFAULT 'active',
      last_message_at TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS demo_bookings (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      phone VARCHAR(50),
      industry VARCHAR(100),
      message TEXT,
      preferred_time VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      plan VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'trial',
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      subscribed_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      link VARCHAR(500),
      read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_integrations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      integration_key VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'connected',
      connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      settings JSONB DEFAULT '{}',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, integration_key)
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipient VARCHAR(255) NOT NULL,
      subject TEXT NOT NULL,
      body TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      provider VARCHAR(50),
      error TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS email_automation_settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      auto_reply_enabled BOOLEAN DEFAULT true,
      reply_mode VARCHAR(50) DEFAULT 'replies_and_inquiries',
      skip_marketing BOOLEAN DEFAULT true,
      skip_newsletters BOOLEAN DEFAULT true,
      skip_social BOOLEAN DEFAULT true,
      skip_transactional BOOLEAN DEFAULT true,
      skip_job_alerts BOOLEAN DEFAULT true,
      custom_skip_domains TEXT[] DEFAULT '{}',
      custom_allow_emails TEXT[] DEFAULT '{}',
      reply_tone VARCHAR(30) DEFAULT 'professional',
      reply_language VARCHAR(10) DEFAULT 'en',
      max_replies_per_day INTEGER DEFAULT 50,
      custom_instructions TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id)
    );
  `);
  schemaInitialized = true;
  console.log("Database schema ensured");
}

// ─── User ────────────────────────────────────────────────────────
export async function getUserByEmail(email: string) {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

export async function getUserById(id: number) {
  const result = await query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

export async function updateUser(id: number, data: { name?: string; email?: string }) {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (data.name) { sets.push(`name = $${idx++}`); values.push(data.name); }
  if (data.email) { sets.push(`email = $${idx++}`); values.push(data.email); }
  sets.push("updated_at = NOW()");
  values.push(id);
  const result = await query(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id, name, email, role, plan`,
    values
  );
  return result.rows[0];
}

export async function createUser(name: string, email: string, hashedPassword: string) {
  const result = await query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, plan",
    [name, email, hashedPassword]
  );
  return result.rows[0];
}

// ─── Leads ───────────────────────────────────────────────────────
export async function getLeadsByUserId(userId: number, limit = 50, offset = 0) {
  const result = await query(
    "SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [userId, limit, offset]
  );
  return result.rows;
}

export async function getLeadById(id: number, userId: number) {
  const result = await query("SELECT * FROM leads WHERE id = $1 AND user_id = $2", [id, userId]);
  return result.rows[0] || null;
}

export async function createLead(data: {
  userId: number; name: string; email: string; phone?: string;
  company?: string; source?: string; notes?: string;
}) {
  const result = await query(
    `INSERT INTO leads (user_id, name, email, phone, company, source, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [data.userId, data.name, data.email, data.phone || null, data.company || null, data.source || "manual", data.notes || null]
  );
  return result.rows[0];
}

export async function updateLead(id: number, userId: number, data: {
  name?: string; email?: string; phone?: string; company?: string;
  status?: string; notes?: string; source?: string;
}) {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) { sets.push(`${key} = $${idx++}`); values.push(val); }
  }
  sets.push("updated_at = NOW()");
  values.push(id, userId);
  const result = await query(
    `UPDATE leads SET ${sets.join(", ")} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteLead(id: number, userId: number) {
  const result = await query("DELETE FROM leads WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
  return result.rows[0] || null;
}

export async function getLeadStats(userId: number) {
  const total = await query("SELECT COUNT(*) as count FROM leads WHERE user_id = $1", [userId]);
  const byStatus = await query(
    "SELECT status, COUNT(*) as count FROM leads WHERE user_id = $1 GROUP BY status",
    [userId]
  );
  const recent = await query(
    "SELECT * FROM leads WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
    [userId]
  );
  return {
    total: parseInt(total.rows[0]?.count || "0"),
    byStatus: byStatus.rows.reduce((acc: Record<string, number>, r: { status: string; count: string }) => {
      acc[r.status] = parseInt(r.count);
      return acc;
    }, {}),
    recent: recent.rows,
  };
}

// ─── Appointments ────────────────────────────────────────────────
export async function getAppointmentsByUserId(userId: number, limit = 50, offset = 0) {
  const result = await query(
    `SELECT a.*, l.name as lead_name, l.email as lead_email
     FROM appointments a LEFT JOIN leads l ON a.lead_id = l.id
     WHERE a.user_id = $1 ORDER BY a.scheduled_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
}

export async function getUpcomingAppointments(userId: number, limit = 5) {
  const result = await query(
    `SELECT a.*, l.name as lead_name, l.email as lead_email
     FROM appointments a LEFT JOIN leads l ON a.lead_id = l.id
     WHERE a.user_id = $1 AND a.scheduled_at >= NOW() AND a.status = 'scheduled'
     ORDER BY a.scheduled_at ASC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function createAppointment(data: {
  userId: number; leadId?: number; title: string; description?: string;
  meetingType?: string; meetingLink?: string; scheduledAt: string;
  durationMinutes?: number;
}) {
  const result = await query(
    `INSERT INTO appointments (user_id, lead_id, title, description, meeting_type, meeting_link, scheduled_at, duration_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.userId, data.leadId || null, data.title, data.description || null,
     data.meetingType || "video", data.meetingLink || null, data.scheduledAt, data.durationMinutes || 30]
  );
  return result.rows[0];
}

export async function updateAppointment(id: number, userId: number, data: {
  title?: string; description?: string; meetingType?: string;
  meetingLink?: string; scheduledAt?: string; durationMinutes?: number; status?: string;
}) {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) { sets.push(`${key === "meetingType" ? "meeting_type" : key === "meetingLink" ? "meeting_link" : key === "durationMinutes" ? "duration_minutes" : key === "scheduledAt" ? "scheduled_at" : key} = $${idx++}`); values.push(val); }
  }
  sets.push("updated_at = NOW()");
  values.push(id, userId);
  const result = await query(
    `UPDATE appointments SET ${sets.join(", ")} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteAppointment(id: number, userId: number) {
  const result = await query("DELETE FROM appointments WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
  return result.rows[0] || null;
}

export async function getAppointmentStats(userId: number) {
  const total = await query("SELECT COUNT(*) as count FROM appointments WHERE user_id = $1", [userId]);
  const upcoming = await query(
    "SELECT COUNT(*) as count FROM appointments WHERE user_id = $1 AND scheduled_at >= NOW() AND status = 'scheduled'",
    [userId]
  );
  const completed = await query(
    "SELECT COUNT(*) as count FROM appointments WHERE user_id = $1 AND status = 'completed'",
    [userId]
  );
  return {
    total: parseInt(total.rows[0]?.count || "0"),
    upcoming: parseInt(upcoming.rows[0]?.count || "0"),
    completed: parseInt(completed.rows[0]?.count || "0"),
  };
}

// ─── Conversations ───────────────────────────────────────────────
export async function getConversationsByUserId(userId: number, limit = 50) {
  const result = await query(
    `SELECT c.*, l.name as lead_name, l.email as lead_email
     FROM conversations c LEFT JOIN leads l ON c.lead_id = l.id
     WHERE c.user_id = $1 ORDER BY c.last_message_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

export async function getActiveConversationCount(userId: number) {
  const result = await query(
    "SELECT COUNT(*) as count FROM conversations WHERE user_id = $1 AND status = 'active'",
    [userId]
  );
  return parseInt(result.rows[0]?.count || "0");
}

// ─── Dashboard Stats ─────────────────────────────────────────────
export async function getDashboardStats(userId: number) {
  const [leadStats, appointmentStats, activeConvCount] = await Promise.all([
    getLeadStats(userId),
    getAppointmentStats(userId),
    getActiveConversationCount(userId),
  ]);

  const conversionRate = leadStats.total > 0
    ? Math.round((appointmentStats.completed / leadStats.total) * 100)
    : 0;

  return {
    leadsCaptured: leadStats.total,
    meetingsBooked: appointmentStats.total,
    conversionRate,
    activeConversations: activeConvCount,
    leadsByStatus: leadStats.byStatus,
    recentLeads: leadStats.recent,
    upcomingAppointments: await getUpcomingAppointments(userId, 5),
  };
}

// ─── Landing page models ─────────────────────────────────────────
export async function createDemoBooking(data: {
  name: string; email: string; company?: string; phone?: string;
  industry?: string; message?: string; preferred_time?: string;
}) {
  const result = await query(
    "INSERT INTO demo_bookings (name, email, company, phone, industry, message, preferred_time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [data.name, data.email, data.company || null, data.phone || null, data.industry || null, data.message || null, data.preferred_time || null]
  );
  return result.rows[0];
}

export async function createContactMessage(name: string, email: string, message: string) {
  const result = await query(
    "INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3) RETURNING *",
    [name, email, message]
  );
  return result.rows[0];
}

export async function subscribeNewsletter(email: string) {
  const result = await query(
    "INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *",
    [email]
  );
  return result.rows[0];
}