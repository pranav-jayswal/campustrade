import { Link } from 'react-router-dom';
import { Heart, MapPin, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Wishlist() {
  useDocumentTitle('Saved Items');
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-1 text-xs font-bold uppercase text-rose-600 dark:text-rose-400">
            ❤️ Saved Vault
          </span>
          <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            Saved Drops & Wishlist
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            Keep an eye on deals, textbook prices, and campus drops.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="self-start rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 sm:p-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
            Your Wishlist is Empty
          </h2>
          <p className="mt-2 max-w-sm text-sm font-medium text-slate-500 dark:text-slate-400">
            Tap the heart icon on any campus listing to bookmark items you want to pick up later.
          </p>
          <Link
            to="/shop"
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold uppercase text-white shadow-sm transition hover:bg-blue-700"
          >
            Explore Campus Drops
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300 shadow-sm">
                  {item.category}
                </span>

                <button
                  type="button"
                  onClick={() => toggleWishlist(item)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <Link
                  to={`/products/${item._id}`}
                  className="text-base font-bold uppercase tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {item.title}
                </Link>

                <p className="mt-2 text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {formatPrice(item.price)}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">
                    {item.condition || 'Good Condition'}
                  </span>
                  {item.campus && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      {item.campus}
                    </span>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    to={`/products/${item._id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700"
                  >
                    View & Purchase
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
