import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createApiKey, getApiKeys, revokeApiKey } from "@/lib/api-keys";
import { unauthorized, badRequest, notFound, apiSuccess } from "@/lib/api-response";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorized();
  }
  
  const userId = session.user.email;
  const keys = getApiKeys(userId);
  
  return apiSuccess({ keys });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorized();
  }
  
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return badRequest("API key name is required");
    }
    
    const userId = session.user.email;
    const result = createApiKey(userId, name.trim());
    
    return apiSuccess(result, 201);
  } catch {
    return badRequest("Invalid request body");
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorized();
  }
  
  try {
    const body = await request.json();
    const { keyId } = body;
    
    if (!keyId) {
      return badRequest("keyId is required");
    }
    
    const userId = session.user.email;
    const success = revokeApiKey(userId, keyId);
    
    if (!success) {
      return notFound("API key not found");
    }
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}