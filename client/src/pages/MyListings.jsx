import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, MapPin, Pencil, Plus, Tag, Trash2, Zap } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';
import ProductFormModal from '../components/admin/ProductFormModal';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function MyListings() {
  useDocumentTitle('My Listings | CampusTrade');

  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProduct, setEditingProduct] = useState(null);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchListings = () => {
    setIsLoading(true);
    setError('');
    axiosClient
      .get('/products/my')
      .then(({ data }) => setListings(data))
      .catch(() => setError("Couldn't load your listings. Please try again."))
      .finally(() => setIsLoading(false));
  };

  useEffect(fetchListings, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    fetchListings();
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/products/${id}`);
      setConfirmingDeleteId(null);
      fetchListings();
    } catch {
      setError("Couldn't delete that listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (product) => {
    const nextStatus = product.status === 'sold' ? 'available' : 'sold';
    try {
      await axiosClient.put(`/products/${product._id}`, { status: nextStatus });
      fetchListings();
    } catch {
      setError("Couldn't update listing status.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-28">
      {/* Student Profile & Seller Verification Banner */}
      <div className="mb-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold uppercase text-slate-900 dark:text-white">{user?.name}</h2>
            {user?.role === 'staff' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Verified Staff / Faculty
              </span>
            ) : user?.isVerifiedStudent ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Student Seller
              </span>
            ) : (
              <span className="rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                Verification Pending
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Campus: <span className="text-slate-900 dark:text-slate-200 font-bold">{user?.campus || 'Institute of Advanced Research, Gandhinagar'}</span>{' '}
            {user?.role === 'staff' ? (
              <>
                {user?.designation && `• ${user.designation} `}
                {user?.department && `• Dept: ${user.department} `}
                {user?.staffCode && `• Staff Code: ${user.staffCode}`}
              </>
            ) : (
              <>
                {(user?.admissionYear || user?.gradYear) && `• Admitted ${user.admissionYear || user.gradYear} `}
                {(user?.enrollmentNo || user?.studentId) && `• Enrollment: ${user.enrollmentNo || user.studentId}`}
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Post New Listing
        </button>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">My Campus Listings</h1>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Manage your active textbook, gadget, and dorm listings.</p>
      </div>

      {error && <p className="mt-6 text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>}

      {isLoading && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="mt-3 h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <div className="mt-12 flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-center shadow-sm">
          <Tag className="h-10 w-10 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-4 text-lg font-bold uppercase text-slate-900 dark:text-white">You haven't listed anything yet</h3>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Have old textbooks, dorm gear, or calculators? Sell them to students near you!
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700"
          >
            Create first listing
          </button>
        </div>
      )}

      {!isLoading && listings.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <div
              key={item._id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="h-full w-full object-cover"
                  />
                )}
                <span
                  className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase shadow-sm ${
                    item.status === 'sold'
                      ? 'border-slate-800 bg-slate-900 text-white'
                      : 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {item.status || 'available'}
                </span>
                <span className="absolute left-3 top-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                  {item.condition || 'Good'}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/products/${item._id}`}
                    className="text-base font-bold uppercase tracking-tight text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    {item.title}
                  </Link>
                  <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{formatPrice(item.price)}</span>
                </div>

                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Category: {item.category}</span>
                  <span>Stock: {item.stock}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleStatus(item)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    Mark {item.status === 'sold' ? 'Available' : 'Sold'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      aria-label="Edit listing"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {confirmingDeleteId === item._id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          disabled={isDeleting}
                          className="rounded-lg border border-rose-600 bg-rose-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-rose-700"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(item._id)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        aria-label="Delete listing"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
