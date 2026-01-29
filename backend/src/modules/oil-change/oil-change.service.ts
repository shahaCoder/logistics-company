/**
 * Service for proxying requests to the pti-bot oil change API
 * This keeps the API key secure on the server side
 */

const BOT_API_BASE = process.env.BOT_API_BASE || process.env.NEXT_PUBLIC_BOT_API_BASE || 'https://webhook.glco.us/api';
const BOT_API_KEY = process.env.BOT_API_KEY || process.env.NEXT_PUBLIC_BOT_API_KEY || '';

if (!BOT_API_KEY) {
  console.warn('⚠️  BOT_API_KEY is not set. Oil change API will not work.');
}

/**
 * Helper function to check if response is HTML instead of JSON
 */
function checkHtmlResponse(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<!');
}

/**
 * Proxy GET request to bot API
 */
export async function proxyGetRequest(path: string): Promise<any> {
  if (!BOT_API_KEY) {
    throw new Error('API key not configured on server');
  }

  const url = `${BOT_API_BASE}/${path}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': BOT_API_KEY,
        'Accept': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    // Check if API returned HTML instead of JSON
    if (checkHtmlResponse(responseText)) {
      throw new Error('API returned HTML instead of JSON. Check bot API configuration.');
    }

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = responseText.substring(0, 200) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Check that response is actually JSON
    if (!contentType.includes('application/json')) {
      throw new Error(`Unexpected content type: ${contentType}. API may not be configured correctly.`);
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse JSON response: ${responseText.substring(0, 200)}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while proxying request');
  }
}

/**
 * Proxy POST request to bot API
 */
export async function proxyPostRequest(path: string, body: any): Promise<any> {
  if (!BOT_API_KEY) {
    throw new Error('API key not configured on server');
  }

  const url = `${BOT_API_BASE}/${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': BOT_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    if (checkHtmlResponse(responseText)) {
      throw new Error('API returned HTML instead of JSON. Check bot API configuration.');
    }

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = responseText.substring(0, 200) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (!contentType.includes('application/json')) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Failed to parse JSON response`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while proxying request');
  }
}
