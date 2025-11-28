// src/app/api/contact-telegram/route.ts
import { NextResponse } from "next/server";

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per minute

function mdEscape(s: string) {
  // Минимальное экранирование для Markdown v2
  return s.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&");
}

function sanitizeInput(input: string, maxLength: number = 1000): string {
  // Remove potentially dangerous characters and limit length
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, "") // Remove HTML brackets
    .trim();
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  // Try to get real IP from headers
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await req.json().catch(() => ({}));
    let { name = "", email = "", message = "" } = body;

    // Sanitize inputs
    name = sanitizeInput(String(name), 200);
    email = sanitizeInput(String(email), 254);
    message = sanitizeInput(String(message), 2000);

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "name, email, message are required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check environment variables
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!token || !chatId) {
      // Log in development only
      if (process.env.NODE_ENV === "development") {
        console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
      }
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Prepare message with escaped content
    const text =
      `📩 *New contact message*\n` +
      `👤*Name:* ${mdEscape(name)}\n` +
      `✉️*Email:* ${mdEscape(email)}\n` +
      `\n📝*Message:*\n${mdEscape(message)}`;

    // Send to Telegram
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "MarkdownV2" }),
    });

    if (!tg.ok) {
      const err = await tg.text().catch(() => "Unknown error");
      // Don't expose internal errors to client
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === "development") {
      console.error("Contact form error:", error);
    }
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
