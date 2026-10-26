import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  X,
  Zap,
  RotateCcw,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { formatPrice } from '../utils/formatPrice';
import useDocumentTitle from '../hooks/useDocumentTitle';

const getMinDateTime = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getPresetDateTime = (daysAhead = 0, hour = 16) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyShippingForm = {
  address: '',
  city: 'At IAR Campus',
  meetupTime: '',
  postalCode: '',
  country: 'India',
};

export default function Cart() {
  useDocumentTitle('Cart | CampusTrade');

  const { items, removeItem, updateQuantity, subtotal, totalDeposit, grandTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('cart'); // 'cart' | 'shipping' | 'confirmation'
  const [shippingForm, setShippingForm] = useState(emptyShippingForm);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setStep('shipping');
  };

  const handleShippingChange = (e) => {
    setShippingForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (!shippingForm.address.trim()) {
      setOrderError('Please enter a campus meeting/trading address.');
      return;
    }

    if (!shippingForm.meetupTime) {
      setOrderError('Please select a future date and time for the meeting/trade.');
      return;
    }

    const selectedTime = new Date(shippingForm.meetupTime);
    if (isNaN(selectedTime.getTime()) || selectedTime.getTime() < Date.now() - 60000) {
      setOrderError('Please select a future meeting date and time.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const { data } = await axiosClient.post('/orders', {
        orderItems: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          listingType: item.listingType || 'buy',
          rentDeposit: item.rentDeposit || 0,
          rentDurationDays: item.rentDurationDays || 1,
        })),
        shippingAddress: {
          address: shippingForm.address.trim(),
          city: 'At IAR Campus',
          meetupTime: shippingForm.meetupTime,
          postalCode: shippingForm.meetupTime,
          country: 'India',
        },
      });
      setConfirmedTotal(data.totalAmount + (data.totalDeposit || 0));
      clearCart();
      setStep('confirmation');
    } catch (err) {
      setOrderError(
        err.response?.data?.message || 'Something went wrong placing your order. Please try again.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 sm:p-12 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <span className="mt-6 inline-block rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold uppercase text-blue-700 dark:text-blue-300">
            Deal Locked In
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            Order Confirmed
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Total Handover Amount: <span className="text-slate-900 dark:text-white font-extrabold">{formatPrice(confirmedTotal)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Your campus seller has received your trade schedule. Meet up at your designated campus spot to inspect and complete the handover!
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/my-orders"
              className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700"
            >
              Track In My Orders
            </Link>
            <Link
              to="/shop"
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-xs font-bold uppercase text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 sm:p-16 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            Your Campus Bag Is Empty
          </h1>
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Snag used textbooks, dorm gear, rental calculators, or free senior giveaways!
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-8 py-3.5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700"
          >
            Explore Campus Drops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-28">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          {step === 'cart' ? 'Step 1 of 2' : 'Step 2 of 2'}
        </span>
        <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
          {step === 'cart' ? 'Your Campus Bag' : 'Campus Meeting & Trade Details'}
        </h1>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {step === 'cart' ? (
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => {
              const isRent = item.listingType === 'rent';
              const isGiveaway = item.isFreeGiveaway || item.listingType === 'giveaway' || item.price === 0;

              return (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      {isGiveaway ? (
                        <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                          🎓 Free Giveaway
                        </span>
                      ) : isRent ? (
                        <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                          🔄 Rental ({item.rentDurationDays}d)
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 flex items-baseline gap-2">
                      {isGiveaway ? (
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          FREE (₹0)
                        </span>
                      ) : (
                        <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                          {formatPrice(item.price)}
                        </span>
                      )}

                      {isRent && item.rentDeposit > 0 && (
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          (+₹{item.rentDeposit * item.quantity} refundable deposit)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="rounded-full p-2 text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Meeting / Trading Address
                </label>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">On-Campus Handover</span>
              </div>
              <input
                id="address"
                name="address"
                required
                placeholder="e.g. Block C / College Canteen / College Library / etc."
                value={shippingForm.address}
                onChange={handleShippingChange}
                className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              {/* Quick suggestion tags for common meetup spots */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-semibold text-slate-400">Quick suggestions:</span>
                {['Block C', 'College Canteen', 'College Library', 'Main Campus Gate', 'Central Lawn'].map((spot) => (
                  <button
                    key={spot}
                    type="button"
                    onClick={() => setShippingForm((prev) => ({ ...prev, address: spot }))}
                    className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition"
                  >
                    {spot}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Campus Location
                </label>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>At IAR Campus</span>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="meetupTime" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Time of Meeting / Trade
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Future Date & Time</span>
                </div>
                <input
                  type="datetime-local"
                  id="meetupTime"
                  name="meetupTime"
                  required
                  min={getMinDateTime()}
                  value={shippingForm.meetupTime}
                  onChange={handleShippingChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Quick time selection pills and note */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="font-semibold text-slate-500 dark:text-slate-400">Quick set trade time:</span>
                <button
                  type="button"
                  onClick={() => setShippingForm((prev) => ({ ...prev, meetupTime: getPresetDateTime(0, 16) }))}
                  className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 shadow-xs transition"
                >
                  Today 4:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => setShippingForm((prev) => ({ ...prev, meetupTime: getPresetDateTime(1, 13) }))}
                  className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 shadow-xs transition"
                >
                  Tomorrow 1:00 PM
                </button>
                <button
                  type="button"
                  onClick={() => setShippingForm((prev) => ({ ...prev, meetupTime: getPresetDateTime(1, 16) }))}
                  className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-0.5 font-medium text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 shadow-xs transition"
                >
                  Tomorrow 4:00 PM
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Buyer and seller meet on campus to inspect the item in person and complete the exchange securely.
              </p>
            </div>

            {orderError && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{orderError}</p>}

            <div className="flex items-center gap-4 pt-3">
              <button
                type="submit"
                disabled={isPlacingOrder}
                className="flex-1 rounded-xl bg-blue-600 py-3.5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isPlacingOrder ? 'Locking in order…' : 'Lock It In & Confirm Order'}
              </button>
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* Order Summary Box */}
        <div className="h-fit rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            Summary
          </h2>

          <div className="mt-4 space-y-3 text-xs font-medium">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Items Total ({items.length})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {totalDeposit > 0 && (
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-semibold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Refundable Security Deposit
                </span>
                <span>{formatPrice(totalDeposit)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Campus Delivery / Meetup</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">FREE</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3 text-base font-extrabold text-slate-900 dark:text-white">
              <span>Total Handover Payable</span>
              <span className="text-xl text-blue-600 dark:text-blue-400">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {totalDeposit > 0 && (
            <p className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2.5 text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed border border-amber-200/60 dark:border-amber-900/50">
              🛡️ <strong>Deposit Protection:</strong> The refundable deposit of {formatPrice(totalDeposit)} is returned directly to you once you hand the rental item back to the lender.
            </p>
          )}

          {step === 'cart' && (
            <button
              type="button"
              onClick={handleCheckoutClick}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700"
            >
              Proceed to Campus Pickup →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
