import { useState } from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  Ticket,
  Upload,
  User,
  X,
  AlertCircle,
  Building,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PRESET_BANNERS = [
  {
    name: 'Hackathon / Tech Fest',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Science / Biotech Lab',
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Health / Social Drive',
    url: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Robotics / Hardware',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cultural / Sports Fest',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  },
];

const IAR_DEPARTMENTS = [
  'Department of Computer Science & Engineering',
  'Department of Biological Sciences & Biotechnology',
  'Department of Chemical Sciences',
  'Department of Electrical & Electronics Engineering',
  'Department of Mechanical Engineering',
  'Department of Management Studies (BBA/MBA)',
  'Office of Student Affairs & Campus Wellness',
  'University Sports Board & Cultural Council',
];

export default function EventFormModal({ isOpen, onClose, onEventCreated, currentUser }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Workshop & Seminar');
  const [organizerName, setOrganizerName] = useState(
    currentUser?.name ? `${currentUser.name} (${currentUser.role === 'staff' ? 'Staff' : 'Admin'})` : 'HOD / Coordinator'
  );
  const [department, setDepartment] = useState(
    currentUser?.department || 'Department of Computer Science & Engineering'
  );
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'events@iar.ac.in');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [venue, setVenue] = useState('IAR Main Auditorium, Block A, Gandhinagar');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM - 04:00 PM');
  const [registrationType, setRegistrationType] = useState('free_rsvp');
  const [price, setPrice] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(150);
  const [externalRegistrationUrl, setExternalRegistrationUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [isUrgentNotice, setIsUrgentNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !venue.trim() || !eventDate) {
      setError('Please provide event title, description, venue, and date.');
      return;
    }

    if (registrationType === 'external_link' && !externalRegistrationUrl.trim()) {
      setError('Please provide the external registration link (e.g. Google Form or university portal URL).');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      organizerName: organizerName.trim(),
      department,
      contactEmail: contactEmail.trim(),
      phone: phone.trim(),
      venue: venue.trim(),
      eventDate,
      eventTime,
      registrationType,
      price: registrationType === 'paid_ticket' ? Number(price) : 0,
      totalCapacity: Number(totalCapacity) || 100,
      externalRegistrationUrl: externalRegistrationUrl.trim(),
      bannerUrl,
      isUrgentNotice,
    };

    try {
      const { data } = await axiosClient.post('/events', payload);
      if (onEventCreated) {
        onEventCreated(data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-3xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Announce College Event or Campaign
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Publish an official department fest, workshop, social drive, or registration link for IAR students
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3.5 text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Event or Campaign Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. IAR HackFest 2026 / Campus Blood Donation Drive"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                <option value="Tech Fest & Hackathon">Tech Fest & Hackathon</option>
                <option value="Workshop & Seminar">Workshop & Seminar</option>
                <option value="Cultural & Sports">Cultural & Sports</option>
                <option value="Campus Campaign">Campus Campaign</option>
                <option value="Guest Lecture">Guest Lecture</option>
              </select>
            </div>
          </div>

          {/* Department & Organizer */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Department / Authority *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              >
                {IAR_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Organizer / Faculty Coordinator
              </label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g. Dr. D. K. Sharma (HOD CSE)"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Event Description & Guidelines *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline event agenda, eligible semesters, certificates, prizes, kit inclusions, or volunteer rules..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Venue & Schedule */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Venue Location *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. IAR Main Auditorium / Biotech Lab 102"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Timing / Duration
              </label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="e.g. 10:00 AM - 04:30 PM"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Registration Mode Selector */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/40 p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 mb-2">
                Registration & Ticketing Mode
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setRegistrationType('free_rsvp')}
                  className={`flex flex-col items-start rounded-xl p-3 text-left transition border ${
                    registrationType === 'free_rsvp'
                      ? 'border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800 shadow-xs text-blue-900 dark:text-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/50'
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">1. Free Campus RSVP (₹0)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    1-Click verified student entry pass with instant ticket code.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegistrationType('paid_ticket')}
                  className={`flex flex-col items-start rounded-xl p-3 text-left transition border ${
                    registrationType === 'paid_ticket'
                      ? 'border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800 shadow-xs text-blue-900 dark:text-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/50'
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">2. Paid Event Ticket</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    For hackathon kits, food passes, or workshops (set ₹ price).
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegistrationType('external_link')}
                  className={`flex flex-col items-start rounded-xl p-3 text-left transition border ${
                    registrationType === 'external_link'
                      ? 'border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-800 shadow-xs text-blue-900 dark:text-blue-300 ring-2 ring-blue-100 dark:ring-blue-900/50'
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">3. External Registration Link</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Google Form, Unstop, or official university sports portal.
                  </span>
                </button>
              </div>
            </div>

            {/* Dynamic Inputs based on type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-blue-100 dark:border-blue-900/40">
              {registrationType === 'paid_ticket' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Ticket Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 99"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {registrationType === 'external_link' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Official Registration URL (Google Form / Portal) *
                  </label>
                  <input
                    type="url"
                    value={externalRegistrationUrl}
                    onChange={(e) => setExternalRegistrationUrl(e.target.value)}
                    placeholder="https://forms.gle/... or https://iar.ac.in/events/..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Total Seat Capacity / Passes Available
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={isUrgentNotice}
                  onChange={(e) => setIsUrgentNotice(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="urgentNotice" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Pin to Top Announcement Ticker (Urgent Notice)
                </label>
              </div>
            </div>
          </div>

          {/* Banner Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Event Banner Image
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="Banner Image URL..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600"
              />
            </div>
            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 self-center">Presets:</span>
              {PRESET_BANNERS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setBannerUrl(preset.url)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                    bannerUrl === preset.url
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Publishing Event...' : 'Publish Campus Event'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
