import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import connectToDatabase from "@/lib/db";
import {User} from '@/models/User';

//Next.js App router only takes req parameter
export async function POST(req:NextRequest){
    try {
        await connectToDatabase();
        const { email, password } = await req.json();
        if(!email || !password){
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }
        const existingUser = await User.findOne({email})
        if(existingUser){
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password,10);
        await User.create({ email, password: hashedPassword });
        return NextResponse.json({message:'User registered successfully'}, {status:201} ) 
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}