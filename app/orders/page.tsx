'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SummaryData {
  totalOrders: number;
  totalOrderAmount: number;
  totalPaymentAmount: number;
  totalOutstanding: number;
}

interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface OrderItem {
  _id: string;
  customername: string;
  dueDate: string;
  orderTotal: number;
  amountPaid: number;
  amountDue: number;
  status: 'unpaid' | 'partially_paid' | 'paid';
  createdAt: string;
}

export default function OrdersDashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State
  const [customername, setCustomerName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<LineItemInput[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  async function fetchDashboardData() {
    try {
      setError('');
      const [summaryRes, ordersRes] = await Promise.all([
        fetch('/api/settlements/summary'),
        fetch('/api/orders'),
      ]);

      if (summaryRes.status === 401 || ordersRes.status === 401) {
        router.push('/login');
        return;
      }

      if (!summaryRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const summaryData = await summaryRes.json();
      const ordersData = await ordersRes.json();

      setSummary(summaryData);
      setOrders(ordersData.orders || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItemInput, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customername, dueDate, lineItems }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setCustomerName('');
      setDueDate('');
      setLineItems([{ description: '', quantity: 1, unitPrice: 0 }]);

      await fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders & Settlement Dashboard</h1>
            <p className="text-sm text-gray-500">
              Manage orders, track settlements, and monitor payment statuses.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-100 p-4 text-sm text-red-700">{error}</div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-gray-500">Total Orders</span>
            <div className="mt-2 text-2xl font-bold text-gray-900">{summary?.totalOrders ?? 0}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-gray-500">Total Invoiced</span>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              ${summary?.totalOrderAmount?.toFixed(2) ?? '0.00'}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-gray-500">Total Collected</span>
            <div className="mt-2 text-2xl font-bold text-green-600">
              ${summary?.totalPaymentAmount?.toFixed(2) ?? '0.00'}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-gray-500">Outstanding Balance</span>
            <div className="mt-2 text-2xl font-bold text-amber-600">
              ${summary?.totalOutstanding?.toFixed(2) ?? '0.00'}
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Create Order Form */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Create New Order</h2>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  value={customername}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Line Items</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                {lineItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      required
                      className="flex-1 rounded-md border p-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                      required
                      className="w-20 rounded-md border p-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      step="100"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                      required
                      className="w-24 rounded-md border p-2 text-sm"
                    />
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-blue-600 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Order'}
              </button>
            </form>
          </div>

          {/* Orders Table with Status Filtering */}
          <div className="rounded-lg bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Orders List</h2>
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-500">Filter:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border p-1 text-xs"
                >
                  <option value="all">All</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders match the selected filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 uppercase text-gray-700">
                    <tr>
                      <th className="p-2">Customer</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Paid</th>
                      <th className="p-2">Due</th>
                      <th className="p-2">Due Date</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="p-2 font-medium text-gray-900">{order.customername}</td>
                        <td className="p-2">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              order.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'partially_paid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-2 font-semibold">${order.orderTotal?.toFixed(2)}</td>
                        <td className="p-2 text-green-600">${order.amountPaid?.toFixed(2)}</td>
                        <td className="p-2 text-amber-600">${order.amountDue?.toFixed(2)}</td>
                        <td className="p-2">{new Date(order.dueDate).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Link
                            href={`/orders/${order._id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            View / Pay
                          </Link>
                        </td>
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