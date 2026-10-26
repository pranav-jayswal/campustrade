import { useState } from 'react';
import {
  Star,
  CheckCircle,
  ThumbsUp,
  MapPin,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  X,
  User,
  ChevronDown,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function ProductReviews({
  productId,
  productTitle,
  ratingData = { rating: 4.8, reviewCount: 12 },
  reviews = [],
  onReviewAdded,
  currentUser,
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isWriting, setIsWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [meetupSpot, setMeetupSpot] = useState('IAR Central Library');
  const [reviewerName, setReviewerName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(currentUser?.department || 'B.Tech Student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [helpfulMap, setHelpfulMap] = useState({});

  // Meetup locations popular at IAR
  const meetupOptions = [
    'IAR Central Library Ground Floor',
    'Main Campus Canteen & Cafeteria',
    'Main Academic Quad & Fountain',
    'Hostel Gate & Reception',
    'Biotechnology Lab Corridor',
    'Engineering Workshop & Labs',
    'Campus Cycle Stand & Security Gate',
  ];

  // Calculate star breakdown percentages
  const totalReviews = reviews.length;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    starCounts[star] = (starCounts[star] || 0) + 1;
  });

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '5') return Math.round(Number(r.rating)) === 5;
    if (selectedFilter === '4') return Math.round(Number(r.rating)) === 4;
    if (selectedFilter === 'verified') return r.verifiedPurchase;
    return true;
  });

  const handleHelpful = async (review) => {
    const revId = review._id || review.id || review.name;
    if (helpfulMap[revId]) return; // already liked in session

    setHelpfulMap((prev) => ({ ...prev, [revId]: true }));

    try {
      if (productId && review._id && !String(review._id).startsWith('rev-')) {
        await axiosClient.post(`/products/${productId}/reviews/${review._id}/helpful`);
      }
    } catch (err) {
      // Keep optimistic UI update
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!comment.trim()) {
      setError('Please share a few words about your experience with this item.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      rating,
      title: title.trim() || 'Verified Campus Exchange',
      comment: comment.trim(),
      meetupSpot,
      name: reviewerName.trim() || currentUser?.name || 'IAR Student',
      role: currentUser?.role || 'student',
      department: department.trim() || currentUser?.department || 'Institute of Advanced Research',
    };

    try {
      let createdReview = null;
      if (productId) {
        const { data } = await axiosClient.post(`/products/${productId}/reviews`, payload);
        createdReview = data.review;
      }

      if (!createdReview) {
        createdReview = {
          _id: `rev-${Date.now()}`,
          ...payload,
          verifiedPurchase: true,
          helpfulCount: 0,
          dateStr: 'Just now',
          createdAt: new Date().toISOString(),
        };
      }

      if (onReviewAdded) {
        onReviewAdded(createdReview);
      }

      setSuccessMsg('Your campus review has been posted successfully!');
      setTitle('');
      setComment('');
      setIsWriting(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Trust Highlights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Overall Score Box */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-xs">
          <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {ratingData?.rating || 4.8}
          </span>
          <div className="mt-2 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${
                  s <= Math.round(Number(ratingData?.rating) || 5)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 dark:text-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            Based on {totalReviews || ratingData?.reviewCount || 12} student ratings
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>100% Verified IAR Meetups</span>
          </div>
        </div>

        {/* Star Rating Breakdown Bars */}
        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Community Rating Breakdown
          </p>
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : stars === 5 ? 80 : stars === 4 ? 20 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="flex w-12 items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                    {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium text-slate-500 dark:text-slate-400">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Write Review CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All ({totalReviews})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('5')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
              selectedFilter === '5'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            5 Stars ({starCounts[5] || 0})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('4')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
              selectedFilter === '4'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            4 Stars ({starCounts[4] || 0})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('verified')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
              selectedFilter === 'verified'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Verified Purchases
          </button>
        </div>

        {/* Write a Review Button */}
        <button
          type="button"
          onClick={() => setIsWriting((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300 px-4 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition active:scale-95"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{isWriting ? 'Cancel Review' : 'Write a Campus Review'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Write a Review Form Card */}
      {isWriting && (
        <form
          onSubmit={handleSubmitReview}
          className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-slate-900 p-6 shadow-sm space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Post a Student Review</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help fellow IAR students know about the condition and handoff experience for {productTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsWriting(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-bold text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Interactive Rating Stars */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Your Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const filled = starVal <= (hoverRating || rating);
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starVal)}
                    className="p-1 text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform focus:outline-hidden"
                    title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-3 text-xs font-bold text-amber-800 dark:text-amber-300">
                {rating === 5 && '★★★★★ Excellent'}
                {rating === 4 && '★★★★☆ Very Good'}
                {rating === 3 && '★★★☆☆ Average'}
                {rating === 2 && '★★☆☆☆ Fair'}
                {rating === 1 && '★☆☆☆☆ Needs Improvement'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Headline / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Great condition, perfect for exam prep!"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Campus Meetup Location
              </label>
              <select
                value={meetupSpot}
                onChange={(e) => setMeetupSpot(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {meetupOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Branch / Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. B.Tech Computer Engineering · 2nd Year"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Your Review / Notes
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe item condition, battery backup, pages, responsiveness of the seller, and meeting experience..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsWriting(false)}
              className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Posting Review...' : 'Post Review'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs">
            <MessageSquare className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">No reviews found for this filter</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Be the first verified student to leave a review!</p>
          </div>
        ) : (
          filteredReviews.map((rev, index) => {
            const revId = rev._id || rev.id || `${rev.name}-${index}`;
            const isLiked = helpfulMap[revId];
            const helpfulCount = (Number(rev.helpfulCount) || 0) + (isLiked ? 1 : 0);
            const initials = rev.name
              ? rev.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'ST';

            return (
              <div
                key={revId}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Header: Reviewer info, verified badge, rating */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {/* Initials Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-extrabold text-white shadow-xs">
                      {initials}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{rev.name}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Verified IAR Buyer
                          </span>
                        )}
                        {rev.role === 'staff' && (
                          <span className="rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                            Staff
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {rev.department || 'Institute of Advanced Research'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars and Relative Date */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= Number(rev.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      · {rev.dateStr || 'Recently'}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                {rev.title && (
                  <h5 className="mt-3 text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {rev.title}
                  </h5>
                )}

                {/* Review Comment Text */}
                <p className="mt-1.5 text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                  {rev.comment}
                </p>

                {/* Footer: Meetup Spot & Helpful Button */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs">
                  {rev.meetupSpot && (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span>Meetup: {rev.meetupSpot}</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleHelpful(rev)}
                    disabled={isLiked}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition ${
                      isLiked
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className={`h-3 w-3 ${isLiked ? 'fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400' : ''}`} />
                    <span>{isLiked ? 'Marked Helpful' : 'Helpful'}</span>
                    {helpfulCount > 0 && (
                      <span className="rounded-full bg-white dark:bg-slate-900 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                        {helpfulCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Fullscreen Interactive Modal popup for instant inspection when clicking rating badge
 */
export function ProductReviewsModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  ratingData = { rating: 4.8, reviewCount: 12 },
  reviews,
  onReviewAdded,
  currentUser,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 px-6 py-4 backdrop-blur-xs">
          <div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Verified Campus Reviews
              </h3>
            </div>
            <p className="line-clamp-1 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {productTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition"
            aria-label="Close reviews modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <ProductReviews
            productId={productId}
            productTitle={productTitle}
            ratingData={ratingData}
            reviews={reviews}
            onReviewAdded={onReviewAdded}
            currentUser={currentUser}
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Exclusively locked to Institute of Advanced Research (IAR) community
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-1.5 font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
