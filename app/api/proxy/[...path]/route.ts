import { NextRequest, NextResponse } from "next/server";

const TARGET_URL = "https://ruelux.k.erpnext.com/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleRequest(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleRequest(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleRequest(request, path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  return handleRequest(request, path, "DELETE");
}

// Main proxy logic
async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join("/");
    const url = new URL(`${TARGET_URL}/${path}`);

    // Copy query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Prepare headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (
        !["host", "connection", "content-length", "origin", "referer"].includes(
          key.toLowerCase()
        )
      ) {
        headers.set(key, value);
      }
    });

    // Get body if needed
    let body: string | undefined;
    if (["POST", "PUT"].includes(method)) {
      body = await request.text();
    }

    console.log(`➡️ Proxying ${method} → ${url}`);

    // Forward the request to the target server
    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
      credentials: "include",
    });

    // Prepare response headers (excluding ERPNext’s CORS)
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (
        !key.toLowerCase().startsWith("access-control") &&
        key.toLowerCase() !== "vary"
      ) {
        responseHeaders.set(key, value);
      }
    });

    // Handle cookies from ERPNext
    const setCookies =
      response.headers.getSetCookie?.() || response.headers.get("set-cookie");
    if (setCookies) {
      if (Array.isArray(setCookies)) {
        setCookies.forEach((cookie) =>
          responseHeaders.append("Set-Cookie", cookie)
        );
      } else {
        responseHeaders.append("Set-Cookie", setCookies);
      }
    }

    // ✅ Override CORS headers for your frontend
    const origin =
      request.headers.get("origin") ||
      "https://order-management-system-psi.vercel.app";
    responseHeaders.set("Access-Control-Allow-Origin", origin);
    responseHeaders.set("Access-Control-Allow-Credentials", "true");
    responseHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    responseHeaders.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Cookie"
    );
    responseHeaders.set("Vary", "Origin");

    // Read and return the response
    const responseBody = await response.text();

    console.log(`⬅️ Response: ${response.status} ${response.statusText}`);

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return new NextResponse("Proxy Error", { status: 500 });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
