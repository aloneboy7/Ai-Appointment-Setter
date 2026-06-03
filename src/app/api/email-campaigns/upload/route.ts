import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import * as XLSX from "xlsx";
import Papa from "papaparse";

// POST /api/email-campaigns/upload — parse Excel/CSV file and return contacts
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let contacts: Record<string, string>[] = [];

    if (fileName.endsWith(".csv")) {
      // Parse CSV
      const text = buffer.toString("utf-8");
      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
      });
      contacts = result.data;
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      contacts = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload .csv, .xlsx, or .xls files." },
        { status: 400 }
      );
    }

    if (contacts.length === 0) {
      return NextResponse.json({ error: "No contacts found in the file" }, { status: 400 });
    }

    // Normalize headers — find email/name/company columns
    const normalizedContacts = contacts.map((row) => {
      const normalized: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        const lowerKey = key.toLowerCase().trim();
        // Map common column names to standard fields
        if (["email", "e-mail", "email_address", "emailaddress", "mail"].includes(lowerKey)) {
          normalized.email = String(value).trim();
        } else if (["name", "full_name", "fullname", "full name", "contact_name", "contact"].includes(lowerKey)) {
          normalized.name = String(value).trim();
        } else if (["first_name", "firstname", "first name", "fname"].includes(lowerKey)) {
          normalized.first_name = String(value).trim();
        } else if (["last_name", "lastname", "last name", "lname"].includes(lowerKey)) {
          normalized.last_name = String(value).trim();
        } else if (["company", "organization", "org", "company_name", "companyname", "business"].includes(lowerKey)) {
          normalized.company = String(value).trim();
        } else if (["phone", "phone_number", "phonenumber", "tel", "mobile"].includes(lowerKey)) {
          normalized.phone = String(value).trim();
        } else {
          // Keep custom fields
          normalized[key] = String(value).trim();
        }
      }

      // Build name from parts if not directly available
      if (!normalized.name) {
        const parts = [normalized.first_name, normalized.last_name].filter(Boolean);
        normalized.name = parts.join(" ") || "there";
      }

      return normalized;
    });

    // Filter out contacts without email
    const validContacts = normalizedContacts.filter((c) => c.email && c.email.includes("@"));

    // Detect available variables from the uploaded columns
    const allKeys = new Set<string>();
    validContacts.forEach((c) => Object.keys(c).forEach((k) => allKeys.add(k)));

    return NextResponse.json({
      contacts: validContacts,
      totalRows: contacts.length,
      validContacts: validContacts.length,
      skippedRows: contacts.length - validContacts.length,
      detectedColumns: Array.from(allKeys),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to parse file: " + String(error) }, { status: 500 });
  }
}