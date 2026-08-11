import connectToDatabase from "@/lib/db";
import {getAuthUser} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {Order} from '@/models/Order';

export async function GET(req:NextRequest,{ params }: { params: Promise<{ id: string }> }){
    try {
        await connectToDatabase();
        const userId = getAuthUser(req);
        const { id } = await params
        if(!userId){
            return NextResponse.json({error:'Unauthorized'}, {status:401})
        }
        const order = await Order.findOne({ _id: id, userId })
        if(!order){
            return NextResponse.json({error:'Order not found'}, {status:404})
        }
        return NextResponse.json({ order }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}