import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Heart,
  Laptop,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Ticket,
  Zap,
  RotateCcw,
  GraduationCap,
  Trees,
  TrendingDown,
  Recycle,
  HelpCircle,
  SearchCheck,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatPrice } from '../utils/formatPrice';
import { useWishlist } from '../context/WishlistContext';
import { useCampus } from '../context/CampusContext';
import { calculateProductRating } from '../utils/productRating';
import useDocumentTitle from '../hooks/useDocumentTitle';

const vibeCategories = [
  { label: '🔥 All Drops', category: '' },
  { label: '📚 Textbooks', category: 'Textbooks' },
  { label: '💻 Electronics', category: 'Electronics' },
  { label: '🛋️ Dorm Gear', category: 'Dorm Gear' },
  { label: '🥼 Lab Gear', category: 'Lab Gear' },
];

export default function Home() {
  useDocumentTitle('CampusTrade | Verified Student Marketplace');

  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { selectedCampus } = useCampus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [ecoStats, setEcoStats] = useState({
    totalRecirculated: 214,
    totalRupeesSaved: 96160,
    treesPreserved: 11.8,
    wasteDivertedKg: 445,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params = { limit: 6 };
    if (selectedVibe) params.category = selectedVibe;

    axiosClient
      .get('/products', { params })
      .then(({ data }) => setFeaturedProducts(data.products || []))
      .catch(() => setFeaturedProducts([]))
      .finally(() => setIsLoading(false));

    axiosClient
      .get('/events')
      .then(({ data }) => setFeaturedEvents((data || []).slice(0, 3)))
      .catch(() => setFeaturedEvents([]));

    axiosClient
      .get('/products/eco-stats')
      .then(({ data }) => {
        if (data) setEcoStats(data);
      })
      .catch(() => {});
  }, [selectedVibe]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div className="max-w-2xl">
            {/* Pill Header Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/40 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              100% Student Verified • IAR Gandhinagar
            </div>

            {/* Typography Headline in calm slate and ocean blue */}
            <h1 className="mt-6 text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold uppercase leading-[0.95] tracking-tight text-slate-900 dark:text-white break-words">
              TRADE UR NEXT{' '}
              <span className="inline-block rounded-xl bg-blue-600 px-3 sm:px-4 py-0.5 sm:py-1 text-white shadow-sm">
                ERA
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm sm:text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              Official student marketplace for Institute of Advanced Research, Gandhinagar.
              Zero &ldquo;DM for price&rdquo; drama. Trade textbooks, lab gear, rent drafting kits, and discover senior giveaways with verified IAR batchmates.
            </p>

            {/* Calm Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 flex w-full max-w-md flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search calculus, CS201, calculators..."
                  className="w-full rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 dark:text-white shadow-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition active:scale-95 shrink-0"
              >
                Find
              </button>
            </form>
          </div>

          {/* Floating Trust Badge */}
          <div className="self-start rounded-2xl border border-slate-800 bg-slate-900 dark:border-slate-800 dark:bg-slate-900/90 p-5 text-white shadow-lg sm:max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black">4.9</span>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-200">
              Verified IAR Campus Trades
            </p>
            <p className="mt-2 text-xs font-medium text-slate-400 leading-snug">
              Average student saves ₹3,200 on semester textbooks, calculators & lab gear.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK FEATURE NAVIGATION CHIPS */}
      <section className="mx-auto max-w-7xl px-6 py-2">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Link
            to="/shop?listingType=giveaway"
            className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 hover:shadow-md transition group"
          >
            <div className="rounded-xl bg-emerald-600 text-white p-2">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Senior Freecycle
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">100% Free Items (₹0)</p>
            </div>
          </Link>

          <Link
            to="/shop?listingType=rent"
            className="flex items-center gap-2.5 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 hover:shadow-md transition group"
          >
            <div className="rounded-xl bg-amber-600 text-white p-2">
              <RotateCcw className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Campus Rentals
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Borrow with deposit</p>
            </div>
          </Link>

          <Link
            to="/shop?academicType=pyq"
            className="flex items-center gap-2.5 rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/80 dark:bg-blue-950/40 p-3.5 hover:shadow-md transition group"
          >
            <div className="rounded-xl bg-blue-600 text-white p-2">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Solved PYQs & Notes
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Course tagged CS & BT</p>
            </div>
          </Link>

          <Link
            to="/bounties"
            className="flex items-center gap-2.5 rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/80 dark:bg-purple-950/40 p-3.5 hover:shadow-md transition group"
          >
            <div className="rounded-xl bg-purple-600 text-white p-2">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Request Board
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Post what you need</p>
            </div>
          </Link>

          <Link
            to="/lost-and-found"
            className="flex items-center gap-2.5 rounded-2xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/80 dark:bg-rose-950/40 p-3.5 hover:shadow-md transition group col-span-2 sm:col-span-1"
          >
            <div className="rounded-xl bg-rose-600 text-white p-2">
              <SearchCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
                Lost & Found
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Recover lost items</p>
            </div>
          </Link>
        </div>
      </section>

      {/* CAMPUS ECO-IMPACT & SUSTAINABILITY DASHBOARD (Category E - #12) */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/30 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100 dark:border-emerald-950 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-bold">
                <Recycle className="h-3.5 w-3.5" />
                Live Campus Sustainability Pulse
              </span>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Our Campus Eco-Impact
              </h2>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                Real-time metrics of goods recirculated and carbon footprint reduced at Institute of Advanced Research.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live DB Aggregation
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recirculated Gear</span>
                <RotateCcw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {ecoStats.totalRecirculated}+
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Items kept in campus circulation
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Student Rupee Savings</span>
                <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{ecoStats.totalRupeesSaved?.toLocaleString('en-IN')}+
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Saved compared to retail MRP
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trees Preserved</span>
                <Trees className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {ecoStats.treesPreserved} trees
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Via textbook & paper reuse
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/90 p-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Landfill Diverted</span>
                <Recycle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {ecoStats.wasteDivertedKg} kg
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dorm gear, hardware & books
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 1: PICK THE VIBE (Category Pills) */}
      <section className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold text-blue-700">
            1
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200">
            Pick The Vibe
          </h2>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {vibeCategories.map((vibe) => (
            <button
              key={vibe.label}
              type="button"
              onClick={() => setSelectedVibe(vibe.category)}
              className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                selectedVibe === vibe.category
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {vibe.label}
            </button>
          ))}
        </div>
      </section>

      {/* Step 2: CHOOSE UR LISTING (Campus Drops Grid) */}
      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
              2
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Fresh Campus Drops
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            View All Drops <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="mt-4 h-5 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="mt-2 h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
            <Package className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-bold uppercase text-slate-900 dark:text-white">No listings found in this category</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Be the first student to drop a listing on your campus!</p>
            <Link
              to="/my-listings"
              className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase text-white shadow-sm hover:bg-blue-700 transition"
            >
              Post A Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => {
              const favorited = isWishlisted(product._id);
              const ratingData = calculateProductRating(product);
              const isGiveaway = product.isFreeGiveaway || product.listingType === 'giveaway' || product.price === 0;
              const isRent = product.listingType === 'rent';

              return (
                <div
                  key={product._id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isGiveaway
                      ? 'border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-400'
                      : isRent
                      ? 'border-amber-300 dark:border-amber-800/80 hover:border-amber-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Image container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}

                    {/* Listing Type / Dynamic Rating badge */}
                    {isGiveaway ? (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Senior Giveaway
                      </span>
                    ) : isRent ? (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Rent: ₹{product.rentPricePerDay}/d
                      </span>
                    ) : (
                      <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50/95 dark:bg-amber-950/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 shadow-sm backdrop-blur-xs"
                      >
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{ratingData.rating}</span>
                        <span className="text-[10px] font-normal text-amber-700/80 dark:text-amber-400/80">({ratingData.reviewCount})</span>
                      </span>
                    )}

                    {/* Wishlist Heart button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 shadow-sm transition hover:scale-105 active:scale-95 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800"
                      aria-label="Save item"
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors ${
                          favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Body content */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Course Code / Academic Type Tag */}
                    {(product.courseCode || product.academicType) && (
                      <div className="mb-2 flex items-center gap-1.5">
                        {product.courseCode && (
                          <span className="rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 text-[10px] font-mono font-bold">
                            {product.courseCode}
                          </span>
                        )}
                        {product.academicType && product.academicType !== 'general' && (
                          <span className="rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 text-[10px] font-medium">
                            {product.academicType.toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-1 text-base font-bold text-slate-900 dark:text-white">
                          {product.title}
                        </h3>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          @{product.seller?.name?.toLowerCase().replace(/\s+/g, '') || 'iar_student'}
                        </p>
                      </div>

                      {/* Rupee Price */}
                      <span className="text-lg font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {isGiveaway ? (
                          <span className="text-emerald-600 dark:text-emerald-400">FREE (₹0)</span>
                        ) : isRent ? (
                          <span className="text-amber-600 dark:text-amber-400">₹{product.rentPricePerDay}/d</span>
                        ) : (
                          formatPrice(product.price)
                        )}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">
                        {product.condition || 'Good'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span className="truncate max-w-[140px]">{product.campus || 'IAR Gandhinagar'}</span>
                      </span>
                    </div>

                    <div className="mt-4">
                      <Link
                        to={`/products/${product._id}`}
                        className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 ${
                          isGiveaway
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : isRent
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        {isGiveaway ? 'Claim Senior Gift →' : isRent ? 'Borrow / Rent →' : 'View Drop →'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CAMPUS EVENTS & WORKSHOPS HIGHLIGHT */}
      {featuredEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-bold">
                  <Calendar className="h-3.5 w-3.5" />
                  Campus Life & Tech Feasts
                </span>
                <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Upcoming Campus Events & Hackathons
                </h2>
              </div>
              <Link
                to="/events"
                className="flex items-center gap-1 text-xs font-bold uppercase text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All Events ({featuredEvents.length}+) <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((ev) => {
                const eventDate = new Date(ev.date);
                const monthStr = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                const dayStr = eventDate.getDate();

                return (
                  <div
                    key={ev._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                      <img
                        src={ev.bannerUrl}
                        alt={ev.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex flex-col items-center justify-center rounded-xl bg-white/95 dark:bg-slate-800/95 px-2.5 py-1 text-center shadow-xs">
                        <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400">{monthStr}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{dayStr}</span>
                      </div>
                      <div className="absolute right-3 top-3">
                        <span className="rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 shadow-xs">
                          {ev.registrationType === 'paid_ticket' ? formatPrice(ev.price) : 'Free Pass'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {ev.category}
                      </span>
                      <h3 className="mt-1 line-clamp-1 text-base font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 line-clamp-1">
                        {ev.organizer?.department || 'Institute of Advanced Research'}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {ev.description}
                      </p>

                      <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>

                      <div className="mt-4">
                        <Link
                          to="/events"
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-500 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-600 active:scale-95"
                        >
                          <span>Claim Pass</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* WHY CAMPUSTRADE (Value props) */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-10">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Why CampusTrade
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Built For Campus Life. Zero Drama.
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Verified Students Only
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Only authenticated IAR students with verified college credentials can list and sell. Zero bot accounts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-100 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 shadow-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Campus Meetup & Free Pickup
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                No courier delays or shipping fees. Exchange books and gadgets right at the IAR library, campus canteen, or academic quad.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Direct Rupee Pricing & Deposit Safety
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Transparent student-to-student prices in Indian Rupees (₹) with protected refundable rental deposits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Quick Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3 px-6 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Have textbooks, notes or gear sitting in your dorm?
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Turn your old semester notes into cash or gift them to incoming juniors.
              </p>
            </div>
          </div>

          <Link
            to="/my-listings"
            className="flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95"
          >
            Drop A Listing →
          </Link>
        </div>
      </div>
    </div>
  );
}
