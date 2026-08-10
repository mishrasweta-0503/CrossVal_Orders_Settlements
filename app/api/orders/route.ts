import connectToDatabase from "@/lib/db";
import {getAuthUser} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {Order, ILineItem} from '@/models/Order';

export async function GET(req:NextRequest){
    try {
        await connectToDatabase();
        const userId = getAuthUser(req);
        if(!userId){
            return NextResponse.json({error:'Unauthorized'}, {status:401})
        }
        const orders = await Order.find({ userId }).sort({ createdAt: -1 })
        return NextResponse.json({ orders }, { status: 200 })
    } catch (error) {
        
    }
}

export async function POST(req:NextRequest){
    try {
        await connectToDatabase();
        const userId = getAuthUser(req);
        if(!userId){
            return NextResponse.json({error:'Unauthorized'}, {status:401})
        }
        const { customername, dueDate, lineItems } = await req.json();
        if (!customername || !dueDate || !Array.isArray(lineItems) || lineItems.length === 0) {
            return NextResponse.json({ error: 'Invalid or missing fields' }, { status: 400 });
          }
        const subtotal = lineItems.reduce((sum:number,item:ILineItem) => sum + item.quantity * item.unitPrice,0);
        const orderTotal = subtotal;
        const newOrder = await Order.create({
            userId,
            customername,
            dueDate,
            lineItems,
            subtotal,
            orderTotal,
          });
        return NextResponse.json({ order: newOrder }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}