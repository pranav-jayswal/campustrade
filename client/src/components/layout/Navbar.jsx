import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown, Heart, MapPin, Menu, Moon, ShoppingBag, Sparkles, Sun, User, X, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCampus } from '../../context/CampusContext';
import { useTheme } from '../../context/ThemeContext';

const baseNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop Drops' },
  { to: '/bounties', label: 'Request Board' },
  { to: '/lost-and-found', label: 'Lost & Found' },
  { to: '/events', label: 'Events' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { campusShortName, campusName } = useCampus();
  const { theme, toggleTheme, isDark } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = isAuthenticated
    ? [
        ...baseNavLinks,
        { to: '/my-listings', label: 'Sell' },
        { to: '/my-orders', label: 'My Orders' },
        { to: '/profile', label: 'My Profile' },
        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
      ]
    : baseNavLinks;

  const linkClasses = ({ isActive }) =>
    `text-xs xl:text-sm font-semibold tracking-wide transition-colors whitespace-nowrap ${
      isActive
        ? 'border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 pb-1'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Campus Badge */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src="/favicon.svg"
              alt="CampusTrade"
              className="h-8 w-8 shrink-0 drop-shadow-sm"
            />
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              CampusTrade
            </span>
          </Link>

          {/* Verified Campus Badge (Institute of Advanced Research, Gandhinagar) */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{campusShortName}</span>
          </div>
        </div>

        {/* Center Desktop Navigation (only shown on xl screens so it never overflows or wraps awkwardly) */}
        <nav className="hidden items-center gap-4 2xl:gap-6 xl:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 active:scale-95 shrink-0"
            aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Wishlist Link - visible on all screen sizes */}
          <Link
            to="/wishlist"
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400 hover:border-slate-300 dark:hover:border-slate-600 active:scale-95 shrink-0"
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link - visible on all screen sizes */}
          <Link
            to="/cart"
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-slate-300 dark:hover:border-slate-600 active:scale-95 shrink-0"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Desktop Auth Controls (xl:flex) */}
          <div className="hidden xl:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-sm shrink-0 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 transition"
                  title="Manage My Profile"
                >
                  <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="max-w-[110px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  {user.isVerifiedStudent && (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" title="Verified Member" />
                  )}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-slate-900 dark:bg-slate-800 border dark:border-slate-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 whitespace-nowrap shrink-0"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/login"
                  className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 whitespace-nowrap"
                >
                  Join Campus
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger toggle button (visible on tablet, split-screen, mobile below xl) */}
          <button
            type="button"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm xl:hidden shrink-0 transition hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Drawer for Tablet & Mobile (below xl) */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-6 xl:hidden shadow-lg animate-in slide-in-from-top-2">
          {/* Theme Quick Toggle in Mobile Drawer */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              <span>Theme: {isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-600 transition"
            >
              Switch to {isDark ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* User Status Bar if logged in */}
          {isAuthenticated && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-3.5 shadow-sm">
              <Link to="/profile" className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/60 text-xs font-black text-blue-700 dark:text-blue-300 shrink-0">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</span>
                    {user.isVerifiedStudent && (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" title="Verified Member" />
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 truncate">Manage Profile & Info →</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-slate-900 dark:bg-slate-800 border dark:border-slate-700 px-3.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:hover:bg-slate-700 shrink-0"
              >
                Sign out
              </button>
            </div>
          )}

          {/* Campus Identification Banner */}
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 p-3.5 shadow-sm">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Exclusive Student Marketplace
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {campusName}
              </p>
            </div>
          </div>

          {/* Navigation links styled as calm cards */}
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-semibold tracking-wide transition ${
                    isActive
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <span>{link.label}</span>
                <span className="text-xs text-slate-400">→</span>
              </NavLink>
            ))}
          </nav>

          {/* Non-authenticated actions */}
          {!isAuthenticated && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <Link
                to="/login"
                className="flex-1 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex-1 rounded-full bg-blue-600 py-2.5 text-center text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Join Campus
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
