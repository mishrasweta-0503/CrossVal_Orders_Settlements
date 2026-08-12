// app/api/settlements/route.ts
import connectToDatabase from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import { Payment } from '@/models/Payment';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, amount, note } = await req.json();

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid orderId and positive amount required' },
        { status: 400 }
      );
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate current total paid for this order
    const existingPayments = await Payment.find({ orderId, userId });
    const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const amountDue = Math.max(0, order.orderTotal - totalPaid);

    // Rejection 1: Order is already fully paid
    if (amountDue <= 0) {
      return NextResponse.json(
        { error: 'Order is already fully paid. No further payments accepted.' },
        { status: 400 }
      );
    }

    // Rejection 2: Payment exceeds remaining balance
    if (amount > amountDue) {
      return NextResponse.json(
        { error: `Payment amount ($${amount}) exceeds remaining balance of $${amountDue.toFixed(2)}` },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      userId,
      orderId,
      amount,
      note,
      date: new Date(),
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}