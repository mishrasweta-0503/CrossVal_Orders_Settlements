import connectToDatabase from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import { Payment } from '@/models/Payment';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    const payments = await Payment.find({ userId });

    // Map payment stats onto each order
    const enrichedOrders = orders.map((order) => {
      const orderPayments = payments.filter(
        (p) => p.orderId.toString() === order._id.toString()
      );
      const amountPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
      const amountDue = Math.max(0, order.orderTotal - amountPaid);

      let status = 'unpaid';
      if (amountPaid >= order.orderTotal && order.orderTotal > 0) {
        status = 'paid';
      } else if (amountPaid > 0) {
        status = 'partially_paid';
      }

      return {
        ...order.toObject(),
        amountPaid,
        amountDue,
        status,
      };
    });

    return NextResponse.json({ orders: enrichedOrders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const userId = getAuthUser(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customername, dueDate, lineItems } = await req.json();

    if (!customername || !dueDate || !lineItems || !Array.isArray(lineItems)) {
      return NextResponse.json(
        { error: 'Customer name, due date, and line items are required' },
        { status: 400 }
      );
    }

    // Calculate subtotal from line items
    const subtotal = lineItems.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    );

    // If orderTotal is distinct or includes tax/fees, set it here; otherwise match subtotal
    const orderTotal = subtotal;

    const newOrder = await Order.create({
      userId,
      customername,
      dueDate,
      lineItems,
      subtotal,   // <-- Added subtotal here
      orderTotal,
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}