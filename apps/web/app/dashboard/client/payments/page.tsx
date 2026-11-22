'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Payment {
  id: string;
  status: string;
  amount: number;
  gst: number;
  total: number;
  processedAt: string | null;
  createdAt: string;
  booking: {
    id: string;
    serviceType: string;
    location: string;
    completedAt: string | null;
  } | null;
  invoice: {
    id: string;
    invoiceNumber: string;
  } | null;
}

interface PaymentSummary {
  totalSpent: number;
  totalPayments: number;
  completedCount: number;
  pendingCount: number;
  averagePayment: number;
}

export default function ClientPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayments();
    }
  }, [status, selectedStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/client/payments', window.location.origin);
      if (selectedStatus) {
        url.searchParams.set('status', selectedStatus);
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600" />
          <p className="text-gray-400">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="mt-2 text-gray-400">
            View and manage all your payments and invoices
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-400 text-sm font-medium">Total Spent</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(summary.totalSpent)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-400 text-sm font-medium">Total Payments</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {summary.totalPayments}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-400 text-sm font-medium">Completed</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {summary.completedCount}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-400 text-sm font-medium">Pending</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {summary.pendingCount}
              </p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === ''
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatus('COMPLETED')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === 'COMPLETED'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setSelectedStatus('PROCESSING')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === 'PROCESSING'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Processing
          </button>
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 mb-4">No payments found</p>
              <Link
                href="/dashboard/client/claims"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View your claims →
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(payment.processedAt || payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <p className="font-medium text-gray-900">
                        {payment.booking?.serviceType.replace(/_/g, ' ')}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {payment.booking?.id}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {payment.booking?.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.total)}
                      </div>
                      <div className="text-xs text-gray-400">
                        inc. {formatCurrency(payment.gst)} GST
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.invoice && (
                        <Link
                          href={`/api/invoices/${payment.invoice.id}/pdf`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Invoice
                        </Link>
                      )}
                      {!payment.invoice && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* DR-1008: no "Manage Subscription" button. Clients use the platform free
            (see app/api/client/subscription), so there is no subscription to manage
            and the button led to a page that does not exist. */}
      </div>
    </div>
  );
}
