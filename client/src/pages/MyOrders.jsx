import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Key,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatPrice } from '../utils/formatPrice';
import useDocumentTitle from '../hooks/useDocumentTitle';

const formatMeetupTime = (timeStr) => {
  if (!timeStr) return null;
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return timeStr;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const isPastTime = (timeStr) => {
  if (!timeStr) return false;
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return false;
  return d.getTime() <= Date.now();
};

const statusBadgeStyles = {
  pending: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  processing: 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  shipped: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  delivered: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

const statusLabels = {
  pending: '🤝 Meetup Scheduled',
  processing: '🤝 Meetup Scheduled',
  shipped: 'Campus Meetup In Progress',
  delivered: '🎉 Trade Completed',
  cancelled: '⚠️ Trade Unsuccessful',
};

const statusIcons = {
  pending: Clock,
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const CANCEL_REASONS = [
  'Seller did not show up at campus meeting spot',
  'Buyer could not make it to meeting spot',
  'Item condition was rejected / did not match photos',
  'Mutually agreed to cancel the trade',
  'Price or item terms could not be agreed upon in person',
  'Other reason',
];

export default function MyOrders() {
  useDocumentTitle('My Orders | CampusTrade');

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'completed' | 'cancelled'
  
  // Modals & Action State
  const [completeModalOrder, setCompleteModalOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionNotice, setActionNotice] = useState(null); // { type: 'success' | 'error', message: '' }

  const loadOrders = () => {
    setIsLoading(true);
    setError('');
    axiosClient
      .get('/orders/my')
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Couldn't load your order history. Please try again."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleConfirmComplete = async () => {
    if (!completeModalOrder) return;
    setIsSubmittingAction(true);
    setActionNotice(null);

    try {
      const { data } = await axiosClient.put(`/orders/${completeModalOrder._id}/complete`, {
        otp: completeModalOrder.handoverOtp,
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === completeModalOrder._id ? data : o))
      );
      setCompleteModalOrder(null);
      setActionNotice({
        type: 'success',
        message: '🎉 Trade marked as Successful! Payment recorded as Paid at Handover.',
      });
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.response?.data?.message || 'Could not complete the order. Please try again.',
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setIsSubmittingAction(true);
    setActionNotice(null);

    const finalReason = selectedReason === 'Other reason' && customReason.trim()
      ? customReason.trim()
      : selectedReason;

    try {
      const { data } = await axiosClient.put(`/orders/${cancelModalOrder._id}/cancel`, {
        reason: finalReason,
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === cancelModalOrder._id ? data : o))
      );
      setCancelModalOrder(null);
      setCustomReason('');
      setActionNotice({
        type: 'success',
        message: '⚠️ Trade marked as Unsuccessful. Product stock has been returned to campus catalog.',
      });
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.response?.data?.message || 'Could not cancel the order. Please try again.',
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRefundDeposit = async (orderId) => {
    setIsSubmittingAction(true);
    setActionNotice(null);
    try {
      const { data } = await axiosClient.put(`/orders/${orderId}/refund-deposit`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      setActionNotice({
        type: 'success',
        message: '✅ Security deposit successfully marked as Refunded!',
      });
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.response?.data?.message || 'Could not refund deposit. Please try again.',
      });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'active') return o.orderStatus === 'pending' || o.orderStatus === 'processing';
    if (activeTab === 'completed') return o.orderStatus === 'delivered';
    if (activeTab === 'cancelled') return o.orderStatus === 'cancelled';
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-28">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Campus Exchange Tracker
        </span>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
          My Campus Orders & Meetups
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Manage campus trading appointments, verify handover OTPs, and update trade completion outcomes.
        </p>

        {/* Status Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            {
              id: 'active',
              label: 'Active Meetups',
              count: orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length,
            },
            {
              id: 'completed',
              label: 'Successful Trades',
              count: orders.filter((o) => o.orderStatus === 'delivered').length,
            },
            {
              id: 'cancelled',
              label: 'Unsuccessful / Cancelled',
              count: orders.filter((o) => o.orderStatus === 'cancelled').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  activeTab === tab.id
                    ? 'bg-blue-500/80 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {actionNotice && (
        <div
          className={`mt-6 flex items-center justify-between rounded-xl border p-4 text-xs font-bold ${
            actionNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <span>{actionNotice.message}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="rounded p-1 hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="h-5 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-4 h-16 w-full rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="mt-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-8 text-center text-xs font-bold uppercase text-rose-700 dark:text-rose-400 shadow-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredOrders.length === 0 && (
        <div className="mt-12 flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center shadow-sm">
          <ShoppingBag className="h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-lg font-bold uppercase text-slate-900 dark:text-white">
            {activeTab === 'all'
              ? 'No Orders Placed Yet'
              : `No ${activeTab} Orders Found`}
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Browse verified listings from students across campus.
          </p>
          <Link
            to="/shop"
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700"
          >
            Start shopping
          </Link>
        </div>
      )}

      {!isLoading && !error && filteredOrders.length > 0 && (
        <div className="mt-8 space-y-6">
          {filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.orderStatus] || Clock;
            const badgeClass = statusBadgeStyles[order.orderStatus] || 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
            const isActiveOrder = order.orderStatus === 'pending' || order.orderStatus === 'processing';
            const isCompleted = order.orderStatus === 'delivered';
            const isCancelled = order.orderStatus === 'cancelled';
            const pastMeeting = isPastTime(order.shippingAddress?.meetupTime);

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-6 py-4">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Order Placed</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Due / Paid</p>
                      <p className="mt-0.5 text-sm font-extrabold text-blue-600 dark:text-blue-400">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    {order.totalDeposit > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Security Deposit</p>
                        <p className="mt-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          {formatPrice(order.totalDeposit)} ({order.depositStatus === 'refunded' ? '✓ Refunded' : 'Held'})
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Order Ref</p>
                      <p className="mt-0.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase shadow-sm ${badgeClass}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusLabels[order.orderStatus] || order.orderStatus}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                        isCompleted
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : isCancelled
                          ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {isCompleted
                        ? 'Payment: Paid at Handover'
                        : isCancelled
                        ? 'Payment: Unpaid / Cancelled'
                        : 'Payment: Due on Handover (UPI / Cash)'}
                    </span>
                  </div>
                </div>

                {/* Products List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 px-6">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          to={`/products/${item.product?._id || item.product}`}
                          className="text-sm font-bold uppercase text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Qty: {item.quantity}</p>
                          {item.listingType === 'rent' && (
                            <span className="rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-bold">
                              🔄 Rental ({item.rentDurationDays || 1}d) • Deposit: {formatPrice((item.rentDeposit || 0) * item.quantity)}
                            </span>
                          )}
                          {item.listingType === 'giveaway' && (
                            <span className="rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-bold">
                              🎓 Free Giveaway
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Meeting & Trading Location Details Bar */}
                {order.shippingAddress && (
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 px-6 py-3.5 text-xs font-medium text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-slate-900 dark:text-white uppercase font-bold">Meeting Address:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{order.shippingAddress.address}</span>
                      <span className="text-slate-400">•</span>
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                        {order.shippingAddress.city || 'At IAR Campus'}
                      </span>
                    </div>
                    {(order.shippingAddress.meetupTime || order.shippingAddress.postalCode) && (
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="text-slate-900 dark:text-white uppercase font-bold">Trade Time:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatMeetupTime(order.shippingAddress.meetupTime || order.shippingAddress.postalCode)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Status & Trade Actions Area */}
                <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 space-y-3">
                  {/* Case A: Active Trade in Progress */}
                  {isActiveOrder && (
                    <div className="space-y-3">
                      {/* Handover OTP Box */}
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/40 p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                            <Key className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                                Trade Handover OTP
                              </span>
                              <span className="rounded bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300">
                                Buyer Secret
                              </span>
                            </div>
                            <p className="font-mono text-xl font-extrabold tracking-widest text-slate-900 dark:text-white">
                              {order.handoverOtp || '4821'}
                            </p>
                          </div>
                        </div>
                        <p className="max-w-sm text-[11px] font-medium text-blue-800 dark:text-blue-300">
                          Inspect the item physically on campus. Disclose this 4-digit code to the seller after paying (UPI/Cash) to complete the trade.
                        </p>
                      </div>

                      {/* Time Alert if meeting time has arrived or passed */}
                      {pastMeeting ? (
                        <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/80 px-3.5 py-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>
                            The scheduled trade meetup time has arrived! Please confirm below whether the trade was successful or unsuccessful.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Scheduled trade meetup: {formatMeetupTime(order.shippingAddress?.meetupTime)}</span>
                        </div>
                      )}

                      {/* Action Buttons for Active Trade */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <a
                          href="tel:+919876543210"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 transition"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          Call Seller (+91 98765 43210)
                        </a>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalOrder(order);
                              setSelectedReason(CANCEL_REASONS[0]);
                              setCustomReason('');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 shadow-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                            Mark Unsuccessful / Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => setCompleteModalOrder(order)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-emerald-700 transition"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Confirm Trade Successful
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case B: Completed Successful Trade */}
                  {isCompleted && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/50 p-4 text-xs text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-extrabold uppercase tracking-wide text-emerald-950 dark:text-emerald-100">
                            Trade Successfully Completed & Paid
                          </span>
                          <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                            Item inspected & payment settled in person at IAR Campus
                            {order.completedAt ? ` on ${new Date(order.completedAt).toLocaleString()}` : ''}.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.totalDeposit > 0 && order.depositStatus === 'held' && (
                          <button
                            type="button"
                            onClick={() => handleRefundDeposit(order._id)}
                            className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-950/80 px-3 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-xs hover:bg-amber-200 dark:hover:bg-amber-900 transition"
                          >
                            🔄 Mark Item Returned & Refund Deposit ({formatPrice(order.totalDeposit)})
                          </button>
                        )}
                        {order.orderItems[0] && (
                          <Link
                            to={`/products/${order.orderItems[0].product?._id || order.orderItems[0].product}`}
                            className="rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs hover:bg-emerald-100 dark:hover:bg-slate-700 transition"
                          >
                            ⭐ Rate & Review Seller
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Case C: Unsuccessful / Cancelled Trade */}
                  {isCancelled && (
                    <div className="flex items-center gap-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/50 p-4 text-xs text-rose-900 dark:text-rose-200">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs shrink-0">
                        <XCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold uppercase tracking-wide text-rose-950 dark:text-rose-100">
                            Trade Unsuccessful / Cancelled
                          </span>
                          <span className="rounded bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                            Zero Fee • Stock Restored
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                          <strong>Reason:</strong> {order.cancellationReason || 'Trade could not be completed on campus.'} Product has been returned to the campus catalog.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Confirm Trade Successful */}
      {completeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="text-base font-extrabold uppercase text-slate-900 dark:text-white">
                  Confirm Trade Completion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCompleteModalOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Please confirm that you have met with the student seller at{' '}
              <strong className="text-slate-900 dark:text-white">{completeModalOrder.shippingAddress?.address}</strong>, inspected the physical condition of the item, and settled payment ({formatPrice(completeModalOrder.totalAmount)}) via UPI or cash.
            </p>

            <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/60 p-3 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
              ✓ Status will update to <strong>Trade Completed</strong> and payment recorded as <strong>Paid at Handover</strong>.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleConfirmComplete}
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-bold uppercase text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSubmittingAction ? 'Updating…' : 'Yes, Trade Completed'}
              </button>
              <button
                type="button"
                onClick={() => setCompleteModalOrder(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Mark Unsuccessful / Cancel */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <XCircle className="h-5 w-5" />
                <h3 className="text-base font-extrabold uppercase text-slate-900 dark:text-white">
                  Mark Trade Unsuccessful
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Why could this campus trade not be completed?
            </p>

            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-xs font-semibold transition ${
                    selectedReason === reason
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other reason' && (
              <textarea
                rows={2}
                placeholder="Please describe what happened..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600"
              />
            )}

            <div className="rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/60 p-3 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
              ℹ️ Marking this order unsuccessful will restore the item stock back to the active campus catalog. Zero fee is charged.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleConfirmCancel}
                className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-bold uppercase text-white shadow-sm hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isSubmittingAction ? 'Processing…' : 'Confirm Cancellation'}
              </button>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
