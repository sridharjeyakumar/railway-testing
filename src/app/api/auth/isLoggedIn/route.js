import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ 
        authenticated: false,
        role: null 
      });
    }

    return NextResponse.json({
      authenticated: true,
      role: token.role
    });
  } catch (error) {
    console.error("Authentication check error:", error);
    return NextResponse.json({ 
      authenticated: false,
      error: "Authentication check failed" 
    }, { status: 500 });
  }
} 