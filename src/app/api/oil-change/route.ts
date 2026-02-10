/**
 * API Route для проксирования запросов к pti-bot API
 * Используется для безопасной передачи API ключа с серверной стороны
 */

import { NextRequest, NextResponse } from 'next/server';

const BOT_API_BASE = process.env.NEXT_PUBLIC_BOT_API_BASE || 'https://webhook.glco.us/api';
const BOT_API_KEY = process.env.NEXT_PUBLIC_BOT_API_KEY || process.env.BOT_API_KEY || '';

// Debug: логируем переменные окружения (только на сервере)
if (typeof window === 'undefined') {
  console.log('[Oil Change API Route] Environment check:');
  console.log('  NEXT_PUBLIC_BOT_API_BASE:', process.env.NEXT_PUBLIC_BOT_API_BASE || 'not set');
  console.log('  NEXT_PUBLIC_BOT_API_KEY:', process.env.NEXT_PUBLIC_BOT_API_KEY ? 'SET (' + process.env.NEXT_PUBLIC_BOT_API_KEY.length + ' chars)' : 'NOT SET');
  console.log('  BOT_API_KEY:', process.env.BOT_API_KEY ? 'SET (' + process.env.BOT_API_KEY.length + ' chars)' : 'NOT SET');
  console.log('  Final BOT_API_KEY:', BOT_API_KEY ? 'SET' : 'NOT SET');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || 'oil-change/list';
    
    if (!BOT_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    const response = await fetch(`${BOT_API_BASE}/${path}`, {
      headers: {
        'X-API-Key': BOT_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying oil change API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || 'oil-change/reset';
    const body = await request.json();
    
    if (!BOT_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    const response = await fetch(`${BOT_API_BASE}/${path}`, {
      method: 'POST',
      headers: {
        'X-API-Key': BOT_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying oil change API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}