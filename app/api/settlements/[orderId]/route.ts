//Fetch all payments recorded for a specific order and calculate the total paid amount and remaining balance

import connectToDatabase from "@/lib/db";
import {getAuthUser} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {Order} from '@/models/Order';
import {Payment, IPayment} from '@/models/Payment';

export async function GET(req:NextRequest,{ params }: { params: Promise<{ orderId: string }> }){
    try {
        await connectToDatabase();
        const userId = getAuthUser(req);
        const {orderId} = await params
        if(!userId){
            return NextResponse.json({error:'Unauthorized'}, {status:401})
        }
        const order = await Order.findOne({ _id: orderId, userId })
        if(!order){
            return NextResponse.json({error:'Order not found'}, {status:404})
        }
        const payments = await Payment.find({ orderId, userId }).sort({ date: -1 });
        const totalPaid = payments.reduce((sum, p:IPayment) => sum + p.amount, 0);
        const remainingBalance = order.orderTotal - totalPaid;
        return NextResponse.json({ payments, totalPaid, remainingBalance, orderTotal: order.orderTotal }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}