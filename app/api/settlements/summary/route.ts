import connectToDatabase from "@/lib/db";
import {getAuthUser} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {Order,IOrder} from '@/models/Order';
import {Payment, IPayment} from '@/models/Payment';

export async function GET(req: NextRequest){
    try {
        await connectToDatabase();
        const userId = getAuthUser(req);
        if(!userId){
            return NextResponse.json({error:'401 Unauthorized'},{status:401})
        }
        const allOrdersBelongingToUser = await Order.find({userId});
        const totalOrderAmount = allOrdersBelongingToUser.reduce((sum, o:IOrder) => sum + o.orderTotal, 0);
        const allPaymentsBelongingToUser = await Payment.find({userId});
        const totalPaymentAmount = allPaymentsBelongingToUser.reduce((sum, p:IPayment) => sum + p.amount, 0);
        const totalOutstanding = totalOrderAmount - totalPaymentAmount
        return NextResponse.json({totalOrders: allOrdersBelongingToUser.length,totalOrderAmount,totalPaymentAmount,totalOutstanding}, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}