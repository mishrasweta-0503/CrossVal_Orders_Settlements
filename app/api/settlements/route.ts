//Record a new payment against an order.

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import {getAuthUser} from "@/lib/auth";
import {Payment} from '@/models/Payment';
import {Order} from '@/models/Order';

export async function POST(req:NextRequest){
    try {
        await connectToDatabase();
        const userId = getAuthUser(req); //extract userid because we need to know and authorize who is making this payment.
        if(!userId){
            return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
        }
        const { orderId, amount, date, note } = await req.json();
        if (!orderId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid orderId or amount' }, { status: 400 });
          }
        const order = await Order.findOne({ _id: orderId, userId }) //verify that the order exists AND that it belongs to the currently logged-in user before recording a payment against it
        if (!order){
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        const newPayment = await Payment.create({
            orderId,
            userId,
            amount,
            date: date || new Date(),
            note,
          });
        return NextResponse.json({ payment: newPayment }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}