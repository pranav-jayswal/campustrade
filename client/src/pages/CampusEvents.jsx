import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Users,
  ShieldCheck,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import useDocumentTitle from '../hooks/useDocumentTitle';
import EventFormModal from '../components/admin/EventFormModal';
import TicketPassModal from '../components/TicketPassModal';

const CATEGORIES = [
  'All',
  'Tech Fest & Hackathon',
  'Workshop & Seminar',
  'Cultural & Sports',
  'Campus Campaign',
];

export default function CampusEvents() {
  useDocumentTitle('Campus Events & Campaigns | IAR Gandhinagar');

  const { user, isAuthenticated } = useAuth();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState(null);
  const [activePass, setActivePass] = useState(null);
  const [activePassEvent, setActivePassEvent] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Quick RSVP form state
  const [rsvpName, setRsvpName] = useState(user?.name || '');
  const [rsvpEmail, setRsvpEmail] = useState(user?.email || '');
  const [rsvpEnrollment, setRsvpEnrollment] = useState(user?.enrollmentNo || user?.studentId || '');
  const [rsvpDept, setRsvpDept] = useState(user?.department || 'B.Tech Student');
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState('');

  // Fetch events
  const fetchEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/events');
      setEvents(data);
    } catch (err) {
      setError('Unable to load campus events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
      return false;
    }
    if (selectedType !== 'all' && ev.registrationType !== selectedType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (ev.title || '').toLowerCase().includes(q);
      const matchDesc = (ev.description || '').toLowerCase().includes(q);
      const matchDept = (ev.organizer?.department || '').toLowerCase().includes(q);
      const matchVenue = (ev.venue || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDept && !matchVenue) {
        return false;
      }
    }
    return true;
  });

  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'staff';

  const handleOpenRsvpModal = (event) => {
    setSelectedEventForRsvp(event);
    setRsvpError('');
    setRsvpName(user?.name || '');
    setRsvpEmail(user?.email || '');
    setRsvpEnrollment(user?.enrollmentNo || user?.studentId || '');
    setRsvpDept(user?.department || 'B.Tech Student');
  };

  const handleConfirmRsvp = async (e) => {
    e.preventDefault();
    if (!rsvpName.trim() || !rsvpEmail.trim()) {
      setRsvpError('Name and university email are required.');
      return;
    }

    setIsRsvpSubmitting(true);
    setRsvpError('');

    try {
      const payload = {
        studentName: rsvpName.trim(),
        email: rsvpEmail.trim(),
        enrollmentNo: rsvpEnrollment.trim(),
        department: rsvpDept.trim(),
        ticketType: selectedEventForRsvp?.registrationType === 'paid_ticket' ? 'Delegate Pass (Paid)' : 'Student RSVP Pass',
      };

      const { data } = await axiosClient.post(
        `/events/${selectedEventForRsvp._id}/register`,
        payload
      );

      // Update event in list
      setEvents((prev) =>
        prev.map((ev) => (ev._id === data.event._id ? data.event : ev))
      );

      // Open ticket pass modal
      setActivePass(data.pass);
      setActivePassEvent(data.event);
      setSelectedEventForRsvp(null);
      setIsPassModalOpen(true);
    } catch (err) {
      setRsvpError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsRsvpSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 pb-28">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 backdrop-blur-xs mb-4">
            <Building className="h-3.5 w-3.5" />
            <span>Institute of Advanced Research · Official Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Campus Events, Fests & Department Campaigns
          </h1>

          <p className="mt-4 text-sm sm:text-base font-normal leading-relaxed text-slate-300">
            Announcements, hackathons, guest lectures, laboratory workshops, and health drives sanctioned by IAR department heads and administration. Claim free passes, book fest tickets, or access official registration links.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {isStaffOrAdmin ? (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Announce New Event / Campaign</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-300">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Verified IAR Student Pass System Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-10 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, workshops, department, venue..."
              className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-white shadow-xs outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
            />
          </div>

          {/* Registration Mode Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0">Registration:</span>
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition whitespace-nowrap ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('free_rsvp')}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition whitespace-nowrap ${
                selectedType === 'free_rsvp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              Free RSVP (₹0)
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('paid_ticket')}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition whitespace-nowrap ${
                selectedType === 'paid_ticket'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              Paid Tickets
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('external_link')}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition whitespace-nowrap ${
                selectedType === 'external_link'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              Official Links ↗
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center shadow-xs">
          <Building className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No events found matching your criteria</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Check back soon or try selecting a different category or registration filter.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((ev) => {
            const dateObj = new Date(ev.eventDate || Date.now());
            const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const dayStr = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
            const capacity = ev.totalCapacity || 100;
            const registered = ev.registeredCount || 0;
            const pctFilled = Math.min(100, Math.round((registered / capacity) * 100));
            const isSoldOut = registered >= capacity;

            return (
              <div
                key={ev._id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                {/* Banner Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <img
                    src={ev.bannerUrl}
                    alt={ev.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Date Badge Top Left */}
                  <div className="absolute left-3.5 top-3.5 flex flex-col items-center justify-center rounded-2xl bg-white/95 dark:bg-slate-800/95 px-3 py-1.5 text-center shadow-md backdrop-blur-xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      {monthStr}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                      {dayStr}
                    </span>
                  </div>

                  {/* Mode Badge Top Right */}
                  <div className="absolute right-3.5 top-3.5">
                    {ev.registrationType === 'free_rsvp' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50/95 dark:bg-emerald-950/90 px-3 py-1 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 shadow-sm">
                        Free RSVP (₹0)
                      </span>
                    )}
                    {ev.registrationType === 'paid_ticket' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 dark:border-blue-800 bg-blue-50/95 dark:bg-blue-950/90 px-3 py-1 text-[11px] font-extrabold text-blue-800 dark:text-blue-300 shadow-sm">
                        Ticket: {formatPrice(ev.price)}
                      </span>
                    )}
                    {ev.registrationType === 'external_link' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-purple-300 dark:border-purple-800 bg-purple-50/95 dark:bg-purple-950/90 px-3 py-1 text-[11px] font-extrabold text-purple-800 dark:text-purple-300 shadow-sm">
                        Official Link <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Category & Department */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {ev.category}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {ev.title}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 line-clamp-1">
                    {ev.organizer?.department || 'Institute of Advanced Research'}
                  </p>

                  <p className="mt-2.5 text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                    {ev.description}
                  </p>

                  {/* Venue & Time info */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1 font-medium">{ev.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{ev.eventTime}</span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <span>{registered} / {capacity} Registered</span>
                      <span className="font-bold text-slate-900 dark:text-white">{pctFilled}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pctFilled >= 90 ? 'bg-rose-500' : pctFilled >= 70 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${pctFilled}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-5 pt-2">
                    {ev.registrationType === 'external_link' ? (
                      <a
                        href={ev.externalRegistrationUrl || 'https://iar.ac.in'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-600 hover:text-white px-5 py-2.5 text-xs font-bold text-purple-700 dark:text-purple-300 shadow-xs transition active:scale-95 group"
                      >
                        <span>Register on Official Portal</span>
                        <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenRsvpModal(ev)}
                        disabled={isSoldOut}
                        className={`flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold shadow-xs transition active:scale-95 ${
                          isSoldOut
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            : ev.registrationType === 'free_rsvp'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Ticket className="h-3.5 w-3.5" />
                        <span>
                          {isSoldOut
                            ? 'Registrations Full'
                            : ev.registrationType === 'free_rsvp'
                            ? 'Claim Free Entry Pass (₹0)'
                            : `Book Ticket (${formatPrice(ev.price)})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RSVP / Ticket Confirmation Modal */}
      {selectedEventForRsvp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative flex flex-col w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedEventForRsvp.registrationType === 'free_rsvp'
                    ? 'Claim Free Student Pass'
                    : 'Confirm Event Ticket'}
                </h3>
                <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedEventForRsvp.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventForRsvp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmRsvp} className="p-6 space-y-4">
              {rsvpError && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-700 dark:text-red-400">
                  {rsvpError}
                </div>
              )}

              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/40 p-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Registration Fee:</span>
                  <span className="text-sm font-black text-blue-700 dark:text-blue-300">
                    {selectedEventForRsvp.registrationType === 'free_rsvp'
                      ? 'FREE (₹0)'
                      : formatPrice(selectedEventForRsvp.price)}
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Venue: {selectedEventForRsvp.venue}
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Date: {new Date(selectedEventForRsvp.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ({selectedEventForRsvp.eventTime})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  IAR University Email *
                </label>
                <input
                  type="email"
                  required
                  value={rsvpEmail}
                  onChange={(e) => setRsvpEmail(e.target.value)}
                  placeholder="e.g. aarav@iar.ac.in"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Enrollment No.
                  </label>
                  <input
                    type="text"
                    value={rsvpEnrollment}
                    onChange={(e) => setRsvpEnrollment(e.target.value)}
                    placeholder="e.g. IAR/2023/11111"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Branch / Dept
                  </label>
                  <input
                    type="text"
                    value={rsvpDept}
                    onChange={(e) => setRsvpDept(e.target.value)}
                    placeholder="e.g. B.Tech CSE"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEventForRsvp(null)}
                  className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRsvpSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
                >
                  <Ticket className="h-3.5 w-3.5" />
                  <span>{isRsvpSubmitting ? 'Confirming...' : 'Get Event Pass'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin / HOD Event Creation Modal */}
      <EventFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={user}
        onEventCreated={(newEvent) => {
          setEvents((prev) => [newEvent, ...prev]);
        }}
      />

      {/* Confirmed Digital Ticket Pass Modal */}
      <TicketPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        pass={activePass}
        event={activePassEvent}
      />
    </div>
  );
}
