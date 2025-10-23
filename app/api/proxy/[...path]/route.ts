import { NextRequest, NextResponse } from 'next/server';

const TARGET_URL = 'https://devssinia.k.frappe.cloud/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const url = new URL(`${TARGET_URL}/${path}`);
    
    console.log('Proxy request:', {
      method,
      path,
      targetUrl: url.toString(),
      headers: Object.fromEntries(request.headers.entries())
    });
    
    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Prepare headers - preserve important headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Skip problematic headers but keep important ones
      if (!['host', 'connection', 'content-length', 'origin', 'referer'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Get request body for POST/PUT requests
    let body: string | undefined;
    if (['POST', 'PUT'].includes(method)) {
      body = await request.text();
      console.log('Proxy forwarding body:', body);
    }

    // Make the proxied request
    console.log('Making request to:', url.toString());
    console.log('Request headers:', Object.fromEntries(headers.entries()));
    
    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
      credentials: 'include',
    });

    // Create response with proper headers
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Allow CORS headers
      if (key.toLowerCase().startsWith('access-control') || 
          key.toLowerCase() === 'set-cookie' ||
          key.toLowerCase() === 'content-type') {
        responseHeaders.set(key, value);
      }
    });

    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');

    const responseBody = await response.text();
    
    console.log('Proxy response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseBody.substring(0, 200) + (responseBody.length > 200 ? '...' : '')
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Proxy Error', { status: 500 });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

