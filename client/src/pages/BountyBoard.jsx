import { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Filter,
  DollarSign,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const URGENCY_STYLES = {
  urgent: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  flexible: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Biotechnology',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Management & Commerce',
  'General Science / First Year',
];

const emptyBountyForm = {
  title: '',
  description: '',
  category: 'Textbooks',
  department: '',
  semester: '',
  courseCode: '',
  budget: '',
  requestType: 'buy', // 'buy' | 'borrow' | 'any'
  neededBy: 'This Week',
  urgency: 'normal',
};

export default function BountyBoard() {
  useDocumentTitle('Campus Request & Bounty Board | CampusTrade');

  const { user, isAuthenticated } = useAuth();
  const [bounties, setBounties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('open'); // 'open' | 'fulfilled' | 'all'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  // Post Request Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyBountyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const loadBounties = () => {
    setIsLoading(true);
    setError('');

    const params = {};
    if (selectedStatus !== 'all') params.status = selectedStatus;
    if (selectedCategory) params.category = selectedCategory;
    if (search.trim()) params.search = search.trim();

    axiosClient
      .get('/bounties', { params })
      .then(({ data }) => setBounties(data || []))
      .catch(() => setError('Could not load campus requests.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadBounties();
  }, [selectedStatus, selectedCategory, search]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateBounty = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setModalError('Please log in with your campus account to post a request.');
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      setModalError('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const payload = {
        ...form,
        budget: Number(form.budget) || 0,
        semester: form.semester ? Number(form.semester) : null,
        courseCode: (form.courseCode || '').toUpperCase().trim(),
      };
      const { data } = await axiosClient.post('/bounties', payload);
      setBounties((prev) => [data, ...prev]);
      setShowModal(false);
      setForm(emptyBountyForm);
      setSuccessNotice('🎉 Your campus request has been posted! Peers can now reach out.');
      setTimeout(() => setSuccessNotice(''), 5000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to post request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkFulfilled = async (id) => {
    try {
      const { data } = await axiosClient.put(`/bounties/${id}/status`, { status: 'fulfilled' });
      setBounties((prev) => prev.map((b) => (b._id === id ? data : b)));
    } catch (err) {}
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-900/50 bg-purple-50/80 dark:bg-purple-950/40 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 shadow-sm">
            📢 Student Request Board
          </span>
          <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Campus Wanted & Bounty Board
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Can’t find what you need? Post what you are looking to buy or borrow, and let IAR peers reach out directly to you.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalError('');
            setShowModal(true);
          }}
          className="self-start flex items-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Post What You Need
        </button>
      </div>

      {successNotice && (
        <div className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 shadow-sm">
          {successNotice}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search wanted drops, CS201, drafter..."
            className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-white shadow-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedStatus('open')}
            className={`rounded-full px-4 py-1.5 transition ${
              selectedStatus === 'open'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Open Requests
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('fulfilled')}
            className={`rounded-full px-4 py-1.5 transition ${
              selectedStatus === 'fulfilled'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Fulfilled
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`rounded-full px-4 py-1.5 transition ${
              selectedStatus === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="h-5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="mt-3 h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="mt-2 h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : bounties.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center shadow-sm">
          <HelpCircle className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No Requests Found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Be the first student to post what you need, and peers will help you out!
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {bounties.map((bounty) => {
            const isFulfilled = bounty.status === 'fulfilled';
            const urgencyClass = URGENCY_STYLES[bounty.urgency] || URGENCY_STYLES.normal;
            const phone = bounty.userPhone || bounty.user?.phone || '+91 98765 43210';
            const cleanTel = (phone || '').replace(/[^0-9+]/g, '');
            const isOwner = user && (bounty.user?._id === user._id || bounty.user === user._id || user.role === 'admin');

            return (
              <div
                key={bounty._id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                  isFulfilled
                    ? 'border-emerald-200 dark:border-emerald-900/60 opacity-80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${urgencyClass}`}>
                        {bounty.urgency === 'urgent' ? '🔥 Urgent Need' : bounty.urgency}
                      </span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-[10px] font-semibold">
                        {bounty.category || 'General'}
                      </span>
                      {bounty.requestType === 'borrow' ? (
                        <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                          Borrow / Loan
                        </span>
                      ) : (
                        <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                          To Buy
                        </span>
                      )}
                    </div>

                    {isFulfilled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                        <CheckCircle className="h-3 w-3" />
                        Fulfilled
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400">
                        Needed: {bounty.neededBy || 'This Week'}
                      </span>
                    )}
                  </div>

                  {/* Course Code Tag */}
                  {bounty.courseCode && (
                    <div className="mb-2">
                      <span className="rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider">
                        {bounty.courseCode} {bounty.semester ? `• Sem ${bounty.semester}` : ''}
                      </span>
                    </div>
                  )}

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {bounty.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {bounty.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Budget / Offer
                    </p>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      {bounty.budget > 0 ? `Up to ${formatPrice(bounty.budget)}` : 'Flexible / Free Borrow'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {phone && (
                      <a
                        href={`tel:${cleanTel}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Call Peer</span>
                      </a>
                    )}

                    {!isFulfilled && isOwner && (
                      <button
                        type="button"
                        onClick={() => handleMarkFulfilled(bounty._id)}
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE BOUNTY REQUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Post Campus Request / Bounty
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Notify campus peers what item or material you need.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBounty} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  What item do you need? *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Need Database System Concepts (Silberschatz) for Sem 4"
                  value={form.title}
                  onChange={handleFormChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Details & Specifics *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Mention edition, if highlighted copy is okay, or specific exam date..."
                  value={form.description}
                  onChange={handleFormChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Request Mode
                  </label>
                  <select
                    name="requestType"
                    value={form.requestType}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="buy">Looking to Buy</option>
                    <option value="borrow">Looking to Borrow (1-7 days)</option>
                    <option value="any">Open to Either</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Urgency
                  </label>
                  <select
                    name="urgency"
                    value={form.urgency}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">🔥 Urgent (Before Exam)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Budget (₹ Max)
                  </label>
                  <input
                    name="budget"
                    type="number"
                    placeholder="e.g. 450 (or 0)"
                    value={form.budget}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Needed By
                  </label>
                  <input
                    name="neededBy"
                    placeholder="e.g. Friday Midterms"
                    value={form.neededBy}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Department (Optional)
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">Any Department (Optional)</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Course Code (Optional)
                  </label>
                  <input
                    name="courseCode"
                    placeholder="e.g. CS201 (Optional)"
                    value={form.courseCode}
                    onChange={handleFormChange}
                    className="mt-1 uppercase font-mono w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {modalError && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{modalError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting…' : 'Publish Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
