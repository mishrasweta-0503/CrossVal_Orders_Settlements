import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0), // Immediate expiration
        path: '/',
      });
    return response
}