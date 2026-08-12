'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  _id: string;
  customername: string;
  dueDate: string;
  lineItems: LineItem[];
  orderTotal: number;
  createdAt: string;
}

interface Payment {
  _id: string;
  amount: number;
  date: string;
  note?: string;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [remainingBalance, setRemainingBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Payment form state
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function fetchOrderAndSettlements() {
    try {
      setError('');
      const [orderRes, settlementRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch(`/api/settlements/${orderId}`),
      ]);

      if (orderRes.status === 401 || settlementRes.status === 401) {
        router.push('/login');
        return;
      }

      if (!orderRes.ok) throw new Error('Failed to load order details');
      if (!settlementRes.ok) throw new Error('Failed to load payment history');

      const orderData = await orderRes.json();
      const settlementData = await settlementRes.json();

      setOrder(orderData.order);
      setPayments(settlementData.payments || []);
      setTotalPaid(settlementData.totalPaid || 0);
      setRemainingBalance(settlementData.remainingBalance ?? orderData.order.orderTotal);
    } catch (err: any) {
      setError(err.message || 'Error loading order details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrderAndSettlements();
  }, [orderId]);

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: paymentAmount,
          note,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      // Reset form & reload details
      setAmount('');
      setNote('');
      await fetchOrderAndSettlements();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-red-600">
        Order not found.{' '}
        <Link href="/orders" className="text-blue-600 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              remainingBalance <= 0
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {remainingBalance <= 0 ? 'Fully Paid' : 'Partially Paid / Unpaid'}
          </span>
        </div>

        {error && (
          <div className="rounded-md bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Financial Summary Banner */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase">Order Total</span>
            <div className="mt-1 text-xl font-bold text-gray-900">
              ${order.orderTotal.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase">Total Paid</span>
            <div className="mt-1 text-xl font-bold text-green-600">
              ${totalPaid.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase">Remaining Balance</span>
            <div className="mt-1 text-xl font-bold text-amber-600">
              ${remainingBalance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
          <div className="flex justify-between border-b pb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{order.customername}</h1>
              <p className="text-xs text-gray-500">
                Created: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(order.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-medium text-gray-900">{item.description}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">${item.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-semibold text-gray-900">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Payment & Settlement History Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Record Payment Form */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingBalance > 0 ? remainingBalance : undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder={`Max: $${remainingBalance.toFixed(2)}`}
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Wire transfer, Card payment"
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-green-600 py-2 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Recording...' : 'Submit Payment'}
              </button>
            </form>
          </div>

          {/* Payment History List */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Settlement History</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="p-3 font-semibold text-green-600">
                          +${p.amount.toFixed(2)}
                        </td>
                        <td className="p-3 text-gray-500">{p.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}