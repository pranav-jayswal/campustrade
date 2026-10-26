import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Heart,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  MessageSquare,
  RotateCcw,
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { calculateProductRating, getFallbackReviews } from '../utils/productRating';
import ProductReviews, { ProductReviewsModal } from '../components/ProductReviews';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviewsList, setReviewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [rentalDuration, setRentalDuration] = useState(3);
  const [justAdded, setJustAdded] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  useDocumentTitle(product ? `${product.title} | CampusTrade` : 'Product Details');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    setQuantity(1);

    axiosClient
      .get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        if (data.rentDurationDays) setRentalDuration(data.rentDurationDays);
        const reviews = data.reviews && data.reviews.length > 0 ? data.reviews : getFallbackReviews(data);
        setReviewsList(reviews);
      })
      .catch(() => setError("Couldn't find this campus drop."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const isRent = product?.listingType === 'rent';
  const isGiveaway = Boolean(product?.isFreeGiveaway || product?.listingType === 'giveaway' || product?.price === 0);

  const handleAddToCart = () => {
    addItem(product, quantity, { rentDurationDays: rentalDuration });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleOpenReviews = () => {
    setShowReviewsModal(true);
    const el = document.getElementById('student-reviews-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviewsList((prev) => [newReview, ...prev]);
    if (product) {
      const updatedReviews = [newReview, ...(product.reviews || [])];
      const newTotal = updatedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const newRating = Math.round((newTotal / updatedReviews.length) * 10) / 10;
      setProduct((prev) => ({
        ...prev,
        rating: newRating,
        numReviews: updatedReviews.length,
        reviews: updatedReviews,
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm" />
          <div className="space-y-4">
            <div className="h-6 w-1/4 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-900 dark:text-white">{error || "Couldn't find this product."}</p>
          <Link
            to="/shop"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-blue-700 transition"
          >
            ← Back to Campus Drops
          </Link>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const seller = typeof product.seller === 'object' && product.seller !== null
    ? product.seller
    : {
        name: 'IAR Student Seller',
        isVerifiedStudent: true,
        phone: '+91 98765 43210',
        campus: product.campus || 'Institute of Advanced Research, Gandhinagar',
      };
  const sellerPhone = seller?.phone || '+91 98765 43210';
  const cleanTelNumber = (sellerPhone || '').replace(/[^0-9+]/g, '');
  const favorited = isWishlisted(product._id);
  const ratingData = calculateProductRating(product);

  const rentalTotalCharge = isRent ? (product.rentPricePerDay || 0) * rentalDuration : 0;
  const rentalDeposit = isRent ? (product.rentDeposit || 0) : 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-28">
      {/* Back button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: Product Image Card */}
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-full w-full object-cover"
            />
          )}

          {/* Listing Type / Condition badges */}
          <div className="absolute left-4 top-4 flex flex-col gap-1.5">
            {isGiveaway ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
                <GraduationCap className="h-4 w-4" />
                Senior Giveaway (₹0)
              </span>
            ) : isRent ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
                <RotateCcw className="h-4 w-4" />
                Campus Rental
              </span>
            ) : (
              product.condition && (
                <span className="rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/80 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
                  {product.condition}
                </span>
              )
            )}
          </div>

          {/* Wishlist toggle */}
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 shadow-sm transition hover:scale-105 active:scale-95 text-slate-700 dark:text-slate-300 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800"
            aria-label="Save item"
          >
            <Heart
              className={`h-5 w-5 ${
                favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'
              }`}
            />
          </button>
        </div>

        {/* Right: Product Details & Purchase */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {product.category}
            </span>
            {product.campus && (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                {product.campus}
              </span>
            )}
            {product.originalMrp > product.price && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold">
                <Sparkles className="h-3 w-3" />
                Save ₹{product.originalMrp - product.price} off MRP
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {product.title}
          </h1>

          {/* Academic Syllabus Info Box */}
          {(product.courseCode || product.department || product.academicType) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {product.courseCode && (
                <span className="rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-2.5 py-1 font-mono font-bold tracking-wider">
                  {product.courseCode} {product.semester ? `• Sem ${product.semester}` : ''}
                </span>
              )}
              {product.department && (
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 font-medium">
                  {product.department}
                </span>
              )}
              {product.academicType && product.academicType !== 'general' && (
                <span className="rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 font-semibold flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {product.academicType === 'pyq'
                    ? 'Solved PYQs & Papers'
                    : product.academicType === 'notes'
                    ? 'Handwritten Notes'
                    : product.academicType === 'manual'
                    ? 'Lab Manual'
                    : 'Textbook'}
                </span>
              )}
            </div>
          )}

          {/* Clickable Rating Stars under title */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenReviews}
              className="group inline-flex items-center gap-2 rounded-lg py-1 text-xs font-semibold transition hover:opacity-90"
              title="Click to view product reviews"
            >
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(ratingData.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white">{ratingData.rating}</span>
              <span className="text-slate-500 dark:text-slate-400">({reviewsList.length || ratingData.reviewCount} reviews)</span>
              <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 underline underline-offset-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                <MessageSquare className="h-3 w-3" />
                See Reviews
              </span>
            </button>
          </div>

          {/* Price Header */}
          <div className="mt-4 flex items-baseline gap-4">
            {isGiveaway ? (
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                FREE (₹0)
              </span>
            ) : isRent ? (
              <div>
                <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                  ₹{product.rentPricePerDay}
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
                  / day
                </span>
              </div>
            ) : (
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
            )}

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                inStock
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300'
              }`}
            >
              {inStock ? `Available (${product.stock} in stock)` : 'Sold Out'}
            </span>
          </div>

          {/* Description */}
          <p className="mt-5 text-sm font-normal leading-relaxed text-slate-600 dark:text-slate-300">
            {product.description}
          </p>

          {/* RENTAL OPTIONS & SECURITY DEPOSIT CARD (Category A - #2) */}
          {isRent && (
            <div className="mt-6 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Rental & Loan Duration
                </div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  ₹{product.rentPricePerDay}/day
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Rental Duration:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRentalDuration(days)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        rentalDuration === days
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                      }`}
                    >
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-amber-200/80 dark:border-amber-900/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Rental Fee ({rentalDuration} days × ₹{product.rentPricePerDay}):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{rentalTotalCharge}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">₹{rentalDeposit}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Payable at Handover:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">₹{rentalTotalCharge + rentalDeposit}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-amber-800 dark:text-amber-300/90 font-medium">
                <ShieldCheck className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>The ₹{rentalDeposit} security deposit is held safely and refunded when item is returned in good shape.</span>
              </div>
            </div>
          )}

          {/* SENIOR GIVAWAY HIGHLIGHT CARD (Category D - #8) */}
          {isGiveaway && (
            <div className="mt-6 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 p-4">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
                <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Senior Freecycle Item — 100% Free
              </div>
              <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                Generously gifted by a campus senior to help juniors succeed in their studies. Meet the senior on campus to receive this item without paying a rupee!
              </p>
            </div>
          )}

          {/* Student / Staff Seller Box */}
          {seller && (
            <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Listed By {seller.role === 'staff' ? 'Staff' : 'Student'}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">{seller.name}</span>
                    {seller.isVerifiedStudent && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    )}

                    {/* Clickable Mobile / Contact Number next to Verified Mark */}
                    {sellerPhone && (
                      <a
                        href={`tel:${cleanTelNumber}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150 group"
                        title="Click to directly call seller"
                      >
                        <Phone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                        <span>{sellerPhone}</span>
                        <span className="text-[10px] font-medium opacity-75">(Call)</span>
                      </a>
                    )}
                  </div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                    {seller.campus || product.campus || 'Institute of Advanced Research, Gandhinagar'}
                  </p>
                </div>

                {/* Clickable Rating Badge in Seller Details Box */}
                <button
                  type="button"
                  onClick={handleOpenReviews}
                  className="flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/80 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-xs self-start sm:self-center hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all cursor-pointer group active:scale-95"
                  title="Click to view product reviews posted by students"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>{ratingData.rating}</span>
                  <span className="text-[11px] font-normal text-amber-700/80 dark:text-amber-400/80">
                    ({reviewsList.length || ratingData.reviewCount} reviews)
                  </span>
                  <span className="ml-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 underline underline-offset-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    View Reviews
                  </span>
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Recommended meetup: IAR Library, Main Canteen, or Academic Quad.</span>
              </div>
            </div>
          )}

          {/* Quantity Controls (for non-giveaway) */}
          {inStock && !isGiveaway && (
            <div className="mt-8 flex items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Quantity
              </span>
              <div className="flex items-center gap-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-slate-900 dark:text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Purchase Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                isGiveaway
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : isRent
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {justAdded
                ? '✓ Added To Bag'
                : !inStock
                ? 'Out of Stock'
                : isGiveaway
                ? '🎓 Claim Free Senior Gift'
                : isRent
                ? `🔄 Rent for ${rentalDuration} Days`
                : 'Add to Cart'}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="flex items-center justify-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
            >
              <Heart className={`h-4 w-4 ${favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-400'}`} />
              {favorited ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* On-Page Dedicated Product Reviews Section */}
      <section id="student-reviews-section" className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-14">
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Campus Reviews & Feedback
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              Verified campus peer trade ratings and meetup reviews at Institute of Advanced Research.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowReviewsModal(true)}
            className="self-start rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
          >
            + Write a Review
          </button>
        </div>

        <ProductReviews
          productId={product._id}
          productTitle={product.title}
          ratingData={ratingData}
          reviews={reviewsList}
          onReviewAdded={handleReviewAdded}
          currentUser={user}
        />
      </section>

      {/* Review Modal popup */}
      <ProductReviewsModal
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        productId={product._id}
        productTitle={product.title}
        ratingData={ratingData}
        reviews={reviewsList}
        onReviewAdded={handleReviewAdded}
        currentUser={user}
      />
    </div>
  );
}
