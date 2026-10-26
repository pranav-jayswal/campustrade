import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-start">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/favicon.svg"
                alt="CampusTrade"
                className="h-8 w-8 shrink-0 drop-shadow-sm"
              />
              <span className="text-xl font-extrabold uppercase tracking-tight text-white">
                CampusTrade
              </span>
            </Link>
            <p className="mt-4 text-xs font-medium leading-relaxed text-slate-400">
              The verified student-to-student marketplace. Buy, sell, and trade textbooks, dorm essentials,
              and gadgets directly on campus without paying ridiculous bookstore fees.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified College Network • 100% Student Safe
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Explore Drops
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs font-medium text-slate-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="hover:text-white transition-colors">
                    All Drops
                  </Link>
                </li>
                <li>
                  <Link to="/bounties" className="hover:text-white transition-colors">
                    Request Board
                  </Link>
                </li>
                <li>
                  <Link to="/lost-and-found" className="hover:text-white transition-colors">
                    Lost & Found
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="hover:text-white transition-colors">
                    Saved Vault
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Student Hub
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs font-medium text-slate-400">
                <li>
                  <Link to="/my-listings" className="hover:text-white transition-colors">
                    Post a Listing
                  </Link>
                </li>
                <li>
                  <Link to="/my-orders" className="hover:text-white transition-colors">
                    Track Orders
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Verify Student ID
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Campus Safety
              </h3>
              <p className="mt-4 text-xs font-medium leading-relaxed text-slate-400">
                Always exchange items in high-traffic campus spots: Central Library, Student Union, or College Canteen.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-8 text-xs font-medium text-slate-400 gap-4">
          <p>© {year} CampusTrade. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            Prices in Indian Rupees (₹) • Built with <Heart className="h-3 w-3 fill-rose-500 text-rose-500 inline" /> for college students.
          </p>
        </div>
      </div>
    </footer>
  );
}
