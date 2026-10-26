import { CheckCircle, Download, MapPin, Printer, QrCode, ShieldCheck, Ticket, X } from 'lucide-react';
import { formatDate } from '../utils/formatPrice';

export default function TicketPassModal({ isOpen, onClose, pass, event }) {
  if (!isOpen || !pass || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedEventDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Upcoming';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Campus Entry Pass
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Pass Printable Body */}
        <div className="p-6 space-y-6" id="printable-pass">
          {/* Confirmed Banner */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/80 p-4 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-1" />
            <h4 className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">Registration Confirmed</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              Your delegate entry spot is locked for this IAR event.
            </p>
          </div>

          {/* Ticket Pass Container with serrated edges styling */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 p-5 space-y-4">
            <div>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                {event.category}
              </span>
              <h4 className="mt-2 text-lg font-black text-slate-900 dark:text-white leading-tight">
                {event.title}
              </h4>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Organized by {event.organizer?.name || 'Department Coordinator'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-700 pt-3 text-xs">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Event Date & Time
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{formattedEventDate}</span>
                <span className="block text-slate-500 dark:text-slate-400 text-[11px]">{event.eventTime}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Venue
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 line-clamp-2">{event.venue}</span>
              </div>
            </div>

            {/* Delegate Information */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 dark:border-slate-700 pt-3 text-xs">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Delegate Name
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{pass.studentName}</span>
                <span className="block text-slate-500 dark:text-slate-400 text-[11px]">{pass.email}</span>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Enrollment / Branch
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{pass.enrollmentNo || 'IAR Student'}</span>
                <span className="block text-slate-500 dark:text-slate-400 text-[11px] truncate">{pass.department}</span>
              </div>
            </div>

            {/* Ticket Code & QR Visualizer */}
            <div className="flex items-center justify-between border-t-2 border-dashed border-slate-300 dark:border-slate-700 pt-4 bg-slate-100/70 dark:bg-slate-800 -mx-5 -mb-5 p-5 rounded-b-2xl">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pass Security Code
                </span>
                <span className="text-xl font-black tracking-wider text-blue-700 dark:text-blue-400 font-mono">
                  {pass.ticketCode || 'IAR-PASS-2026'}
                </span>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified IAR Student Pass
                </span>
              </div>

              {/* QR Visual */}
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-1">
                <QrCode className="h-10 w-10 text-slate-800 dark:text-slate-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save Pass</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2 text-xs font-bold uppercase text-white shadow-xs hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
