import { useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Ticket,
  Trash2,
  Truck,
  Building,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { formatPrice } from '../utils/formatPrice';
import ProductFormModal from '../components/admin/ProductFormModal';
import EventFormModal from '../components/admin/EventFormModal';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PAGE_SIZE = 20;

export default function Admin() {
  useDocumentTitle('Admin Dashboard');

  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'orders' | 'events'

  // Listings state
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingProduct, setEditingProduct] = useState(null);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderUpdateMsg, setOrderUpdateMsg] = useState('');

  // Events state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const fetchProducts = () => {
    setIsLoading(true);
    setError('');
    axiosClient
      .get('/products', { params: { page, limit: PAGE_SIZE } })
      .then(({ data }) => {
        setProducts(data.products);
        setTotalPages(data.pages);
      })
      .catch(() => setError("Couldn't load listings."))
      .finally(() => setIsLoading(false));
  };

  const fetchOrders = () => {
    setOrdersLoading(true);
    axiosClient
      .get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Couldn't load store orders."))
      .finally(() => setOrdersLoading(false));
  };

  const fetchEvents = () => {
    setEventsLoading(true);
    axiosClient
      .get('/events')
      .then(({ data }) => setEvents(data))
      .catch(() => setError("Couldn't load campus events."))
      .finally(() => setEventsLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'events') {
      fetchEvents();
    }
  }, [activeTab, page]);

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
    fetchProducts();
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/products/${id}`);
      setConfirmingDeleteId(null);
      fetchProducts();
    } catch {
      setError("Couldn't delete that listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (orderId, field, value) => {
    try {
      await axiosClient.put(`/orders/${orderId}`, { [field]: value });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, [field]: value } : o))
      );
      setOrderUpdateMsg(`Order updated successfully!`);
      setTimeout(() => setOrderUpdateMsg(''), 3000);
    } catch {
      setError('Failed to update order status.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-ink/60 dark:text-slate-400">
            Full marketplace overview: inventory, sellers, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'listings' && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              <Plus className="h-4 w-4" />
              Add new listing
            </button>
          )}

          {activeTab === 'events' && (
            <button
              type="button"
              onClick={() => setIsEventModalOpen(true)}
              className="inline-flex items-center gap-2 self-start rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Announce Event / Campaign
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-gray-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'listings'
              ? 'border-accent text-accent dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-ink/60 dark:text-slate-400 hover:text-ink dark:hover:text-white'
          }`}
        >
          <Package className="h-4 w-4" />
          Listings ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'orders'
              ? 'border-accent text-accent dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-ink/60 dark:text-slate-400 hover:text-ink dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'events'
              ? 'border-accent text-accent dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-ink/60 dark:text-slate-400 hover:text-ink dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Campus Events ({events.length})
        </button>
      </div>

      {orderUpdateMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-4 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
          <Check className="h-4 w-4" />
          {orderUpdateMsg}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 text-ink/50 dark:text-slate-400">
                  <th className="py-3 pr-4 font-medium">Listing</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Condition</th>
                  <th className="py-3 pr-4 font-medium">Campus</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">Stock</th>
                  <th className="py-3 pr-0 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-slate-800" />
                      </td>
                    </tr>
                  ))}

                {!isLoading && products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-ink/50 dark:text-slate-400">
                      No listings yet.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-ink dark:text-white">{product.title}</span>
                            {product.seller && (
                              <p className="text-[11px] text-ink/50 dark:text-slate-400">
                                Seller: {product.seller.name || 'Campus Student'}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 capitalize text-ink/70 dark:text-slate-300">{product.category}</td>
                      <td className="py-4 pr-4 text-xs font-semibold text-ink/70 dark:text-slate-300">
                        {product.condition || 'Good'}
                      </td>
                      <td className="py-4 pr-4 text-xs text-ink/70 dark:text-slate-300">
                        {product.campus || 'General'}
                      </td>
                      <td className="py-4 pr-4 text-ink/70 dark:text-slate-200">{formatPrice(product.price)}</td>
                      <td className="py-4 pr-4 text-ink/70 dark:text-slate-200">{product.stock}</td>
                      <td className="py-4 pr-0 text-right">
                        {confirmingDeleteId === product._id ? (
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-xs text-ink/50 dark:text-slate-400">Delete?</span>
                            <button
                              type="button"
                              onClick={() => handleDelete(product._id)}
                              disabled={isDeleting}
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteId(null)}
                              className="text-xs font-medium text-ink/50 dark:text-slate-400 hover:text-ink dark:hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="text-ink/40 dark:text-slate-400 hover:text-ink dark:hover:text-white"
                              aria-label={`Edit ${product.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteId(product._id)}
                              className="text-ink/40 dark:text-slate-400 hover:text-red-600"
                              aria-label={`Delete ${product.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-sm font-medium text-ink/70 dark:text-slate-300 hover:text-ink dark:hover:text-white disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-ink/50 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-sm font-medium text-ink/70 dark:text-slate-300 hover:text-ink dark:hover:text-white disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 text-ink/50 dark:text-slate-400">
                <th className="py-3 pr-4 font-medium">Order ID & Date</th>
                <th className="py-3 pr-4 font-medium">Buyer</th>
                <th className="py-3 pr-4 font-medium">Items</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Order Status</th>
                <th className="py-3 pr-0 font-medium">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {ordersLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))}

              {!ordersLoading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink/50 dark:text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              )}

              {!ordersLoading &&
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="py-4 pr-4">
                      <span className="font-mono text-xs font-semibold text-ink dark:text-white">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-xs text-ink/50 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="font-medium text-ink dark:text-white">{order.user?.name || 'Customer'}</p>
                      <p className="text-xs text-ink/50 dark:text-slate-400">{order.user?.email}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-xs text-ink/70 dark:text-slate-300 font-medium">
                        {order.orderItems.map((item) => `${item.name} (x${item.quantity})`).join(', ')}
                      </p>
                    </td>
                    <td className="py-4 pr-4 font-semibold text-accent dark:text-blue-400">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-4 pr-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, 'orderStatus', e.target.value)
                        }
                        className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-ink dark:text-white outline-none focus:border-accent"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 pr-0">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, 'paymentStatus', e.target.value)
                        }
                        className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-ink dark:text-white outline-none focus:border-accent"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campus Events & Campaigns Tab */}
      {activeTab === 'events' && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 text-xs font-semibold uppercase text-ink/50 dark:text-slate-400">
                <th className="pb-3 pr-4">Event / Campaign</th>
                <th className="pb-3 pr-4">Department & Venue</th>
                <th className="pb-3 pr-4">Date & Time</th>
                <th className="pb-3 pr-4">Registration Mode</th>
                <th className="pb-3 pr-4">Attendees / Capacity</th>
                <th className="pb-3 pr-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {eventsLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink/40 dark:text-slate-400">
                    Loading campus events...
                  </td>
                </tr>
              )}

              {!eventsLoading && events.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink/40 dark:text-slate-400">
                    No official campus events published yet. Click "Announce Event / Campaign" above.
                  </td>
                </tr>
              )}

              {!eventsLoading &&
                events.map((ev) => (
                  <tr key={ev._id}>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ev.bannerUrl}
                          alt={ev.title}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{ev.title}</p>
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                            {ev.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{ev.organizer?.department}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{ev.venue}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {new Date(ev.eventDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{ev.eventTime}</p>
                    </td>
                    <td className="py-4 pr-4">
                      {ev.registrationType === 'free_rsvp' && (
                        <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                          Free RSVP (₹0)
                        </span>
                      )}
                      {ev.registrationType === 'paid_ticket' && (
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                          Ticket: {formatPrice(ev.price)}
                        </span>
                      )}
                      {ev.registrationType === 'external_link' && (
                        <span className="rounded-full bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50">
                          Portal Link ↗
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {ev.registeredCount || 0} / {ev.totalCapacity || 100}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {ev.totalCapacity && ev.registeredCount >= ev.totalCapacity ? 'Full' : 'Open'}
                      </p>
                    </td>
                    <td className="py-4 pr-0 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to remove event "${ev.title}"?`)) {
                            try {
                              await axiosClient.delete(`/events/${ev._id}`);
                              fetchEvents();
                            } catch (err) {}
                          }
                        }}
                        className="rounded-lg p-1.5 text-ink/40 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialProduct={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onEventCreated={() => {
          setIsEventModalOpen(false);
          fetchEvents();
        }}
      />
    </div>
  );
}
