import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  Heart,
  MapPin,
  Package,
  Search,
  Star,
  RotateCcw,
  GraduationCap,
  BookOpen,
  Filter,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatPrice } from '../utils/formatPrice';
import { useWishlist } from '../context/WishlistContext';
import { useCampus } from '../context/CampusContext';
import { calculateProductRating } from '../utils/productRating';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PAGE_SIZE = 12;
const conditions = ['Brand New', 'Like New', 'Good', 'Fair'];

const LISTING_MODES = [
  { id: '', label: 'All Items' },
  { id: 'buy', label: '🛒 Buy / Sell' },
  { id: 'rent', label: '🔄 Rentals & Gear' },
  { id: 'giveaway', label: '🎓 Senior Giveaway (₹0)' },
];

const ACADEMIC_FILTERS = [
  { id: '', label: 'All Resources' },
  { id: 'textbook', label: '📚 Textbooks' },
  { id: 'pyq', label: '🎯 Solved PYQs' },
  { id: 'notes', label: '📝 Handwritten Notes' },
  { id: 'manual', label: '🔬 Lab Manuals & Gear' },
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Biotechnology',
  'Mechanical Engineering',
  'Electrical Engineering',
  'General Science / First Year',
];

export default function ProductCatalog() {
  useDocumentTitle('Shop Drops | CampusTrade');

  const [searchParams, setSearchParams] = useSearchParams();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { selectedCampus } = useCampus();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedListingType, setSelectedListingType] = useState(searchParams.get('listingType') || '');
  const [selectedAcademicType, setSelectedAcademicType] = useState(searchParams.get('academicType') || '');
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
  const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semester') || '');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce the search box
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    axiosClient
      .get('/products/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError('');

    const params = {
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      category: selectedCategory || undefined,
      condition: selectedCondition || undefined,
      listingType: selectedListingType === 'giveaway' ? undefined : (selectedListingType || undefined),
      isFreeGiveaway: selectedListingType === 'giveaway' ? 'true' : undefined,
      academicType: selectedAcademicType || undefined,
      department: selectedDepartment || undefined,
      semester: selectedSemester || undefined,
    };

    axiosClient
      .get('/products', { params })
      .then(({ data }) => {
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
      })
      .catch(() => setError("Couldn't load campus drops. Please try again."))
      .finally(() => setIsLoading(false));
  }, [
    page,
    search,
    selectedCategory,
    selectedCondition,
    selectedListingType,
    selectedAcademicType,
    selectedDepartment,
    selectedSemester,
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-blue-950/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
              ⚡ Verified Campus Catalog
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm">
              🌱 Eco-Friendly Recirculation
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Campus Drops & Hub
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Showing verified student listings, equipment rentals, solved PYQs, and senior giveaways from IAR Gandhinagar.
          </p>
        </div>

        <Link
          to="/my-listings"
          className="self-start rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95"
        >
          + Post New Listing
        </Link>
      </div>

      {/* Primary Listing Mode Filters (Buy vs Rent vs Senior Giveaway) */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        {LISTING_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => {
              setSelectedListingType(mode.id);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
              selectedListingType === mode.id
                ? mode.id === 'giveaway'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : mode.id === 'rent'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-5 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search textbook title, course code (CS201), drafter..."
              className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-white shadow-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
            />
          </div>

          {/* Condition pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">Condition:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCondition('');
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                selectedCondition === ''
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Any
            </button>
            {conditions.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => {
                  setSelectedCondition(cond);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 font-semibold transition-all ${
                  selectedCondition === cond
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Academic Hub Tags (Textbooks, PYQs, Notes, Lab Manuals) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Academic Hub:
          </span>
          {ACADEMIC_FILTERS.map((af) => (
            <button
              key={af.id}
              type="button"
              onClick={() => {
                setSelectedAcademicType(af.id);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedAcademicType === af.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {af.label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                selectedCategory === ''
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setPage(1);
                }}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="mt-4 h-5 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="mt-12 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-12 text-center shadow-sm">
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && products.length === 0 && (
        <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center shadow-sm">
          <Package className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No Drops Match Your Filters</h3>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Try adjusting your search terms, listing mode, or resource filters.
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
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

                    {/* Listing Mode Banner Badge */}
                    {isGiveaway ? (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Senior Giveaway (₹0)
                      </span>
                    ) : isRent ? (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md">
                        <RotateCcw className="h-3.5 w-3.5" />
                        For Rent: ₹{product.rentPricePerDay}/day
                      </span>
                    ) : (
                      /* Dynamic Rating badge */
                      <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50/95 dark:bg-amber-950/90 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 shadow-sm backdrop-blur-xs"
                      >
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{ratingData.rating}</span>
                        <span className="text-[10px] font-normal text-amber-700/80 dark:text-amber-400/80">({ratingData.reviewCount})</span>
                      </span>
                    )}

                    {/* Wishlist Heart button on top right */}
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
                    {/* Academic syllabus tagging pills */}
                    {(product.courseCode || product.academicType) && (
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        {product.courseCode && (
                          <span className="rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold font-mono tracking-wider">
                            {product.courseCode} {product.semester ? `• Sem ${product.semester}` : ''}
                          </span>
                        )}
                        {product.academicType && product.academicType !== 'general' && (
                          <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-semibold">
                            {product.academicType === 'pyq'
                              ? 'Solved PYQ'
                              : product.academicType === 'notes'
                              ? 'Handwritten Notes'
                              : product.academicType === 'manual'
                              ? 'Lab Manual'
                              : 'Textbook'}
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

                      {/* Pricing Display */}
                      <div className="text-right">
                        {isGiveaway ? (
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            FREE (₹0)
                          </span>
                        ) : isRent ? (
                          <div>
                            <span className="text-lg font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
                              ₹{product.rentPricePerDay}/day
                            </span>
                            <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                              +₹{product.rentDeposit} deposit
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {product.description}
                    </p>

                    {/* Bottom Metadata */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">
                        {product.condition || 'Good'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <span className="truncate max-w-[140px]">{product.campus || 'IAR Gandhinagar'}</span>
                      </span>
                    </div>

                    {/* Action button */}
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
                        {isGiveaway ? 'Claim Senior Gift →' : isRent ? 'Borrow / Rent Terms →' : 'View Details →'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
