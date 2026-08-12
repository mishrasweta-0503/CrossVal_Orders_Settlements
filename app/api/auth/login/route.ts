import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import {User} from '@/models/User';
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { email, password } = await req.json();
        if(!email || !password){
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }
        const user = await User.findOne({ email });
        if(!user){
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const token = signToken(user._id.toString());
        const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
          });
        return response
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}