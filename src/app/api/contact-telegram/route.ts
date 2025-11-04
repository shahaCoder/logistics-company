// src/app/api/telegram/route.ts
import { NextResponse } from "next/server";

function mdEscape(s: string) {
  // Минимальное экранирование для Markdown v2 (если переключишься на HTML — убери parse_mode)
  return s.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&");
}

export async function POST(req: Request) {
  const { name = "", email = "", message = "" } = await req.json().catch(() => ({}));

  if (!name || !email || !message) {
    return NextResponse.json({ error: "name, email, message are required" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  if (!token || !chatId) {
    return NextResponse.json({ error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID" }, { status: 500 });
  }

  const text =
    `📩 *New contact message*\n` +
    `👤*Name:* ${mdEscape(name)}\n` +
    `✉️*Email:* ${mdEscape(email)}\n` + 
    `\n📝*Message:*\n${mdEscape(message)}`;

  const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "MarkdownV2" }),
  });

  if (!tg.ok) {
    const err = await tg.text();
    return NextResponse.json({ error: `Telegram error: ${err}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
