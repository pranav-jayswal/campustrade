import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Phone,
  CheckCircle,
  HelpCircle,
  X,
  Package,
  Sparkles,
  Tag,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const CATEGORIES = [
  'Electronics',
  'ID Cards & Wallets',
  'Keys',
  'Books & Stationery',
  'Bottles & Lunchboxes',
  'Clothing & Lab Coats',
  'Bags & Backpacks',
  'Other',
];

const LOCATIONS = [
  'Central Library',
  'Main Canteen & Food Court',
  'Computer Lab 304 / Block A',
  'Biotechnology Lab 201',
  'Academic Quad Lawn',
  'Main Auditorium',
  'Hostel Gate & Reception',
];

const emptyReportForm = {
  type: 'lost', // 'lost' | 'found'
  title: '',
  description: '',
  category: 'Other',
  location: 'Central Library',
  dateOccurred: new Date().toISOString().split('T')[0],
  imageUrl: '',
  contactPhone: '',
};

export default function LostAndFound() {
  useDocumentTitle('Campus Lost & Found | CampusTrade');

  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyReportForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Image Drag & Drop / Upload State
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  const loadItems = () => {
    setIsLoading(true);
    setError('');

    const params = { type: activeTab };
    if (selectedCategory) params.category = selectedCategory;
    if (search.trim()) params.search = search.trim();

    axiosClient
      .get('/lost-found', { params })
      .then(({ data }) => setItems(data || []))
      .catch(() => setError('Could not load campus lost and found records.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, [activeTab, selectedCategory, search]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image file size must be less than 10MB.');
      return;
    }

    setImageError('');
    setIsUploadingImage(true);
    setUploadedFileName(file.name);

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageUrl: previewUrl }));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data && data.imageUrl) {
        setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      }
    } catch (uploadErr) {
      setImageError(
        uploadErr.response?.data?.message ||
          'Failed to upload image. Please try again or paste an image URL instead.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    setUploadedFileName('');
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openReportModal = (defaultType = activeTab) => {
    setForm({
      ...emptyReportForm,
      type: defaultType,
      contactPhone: user?.phone || '',
    });
    setModalError('');
    setImageError('');
    setUploadedFileName('');
    setImageTab('upload');
    setShowModal(true);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setModalError('Please log in with your campus account to file a report.');
      return;
    }
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setModalError('Title, description, and campus location are required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const { data } = await axiosClient.post('/lost-found', form);
      if (data.type === activeTab) {
        setItems((prev) => [data, ...prev]);
      }
      setShowModal(false);
      setForm(emptyReportForm);
      setUploadedFileName('');
      setImageError('');
      setSuccessNotice('🎉 Your report has been published to the campus board!');
      setTimeout(() => setSuccessNotice(''), 5000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkResolved = async (id) => {
    try {
      const { data } = await axiosClient.put(`/lost-found/${id}/status`, { status: 'claimed' });
      setItems((prev) => prev.map((it) => (it._id === id ? data : it)));
    } catch (err) {}
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-sm">
            🔍 Official IAR Hub
          </span>
          <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Campus Lost & Found Board
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Lost your student ID, calculator, keys, or water bottle? Report or claim found items directly with verified peers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openReportModal(activeTab)}
          className="self-start flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Report Lost or Found Item
        </button>
      </div>

      {successNotice && (
        <div className="mt-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 shadow-sm">
          {successNotice}
        </div>
      )}

      {/* Mode Toggle: Lost Items vs Found Items */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('lost')}
          className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition shadow-2xs ${
            activeTab === 'lost'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          🔍 Lost Items (Looking For)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('found')}
          className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition shadow-2xs ${
            activeTab === 'found'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          📦 Found Items (Safe Keeping)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bottle, keys, wallet, Library..."
            className="w-full rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-white shadow-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`rounded-full px-3 py-1 font-semibold transition ${
              selectedCategory === ''
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="mt-4 h-5 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="mt-2 h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center shadow-sm">
          <Package className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            No {activeTab === 'lost' ? 'Lost' : 'Found'} Items Reported
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Great news! If you find or misplace something on campus, report it here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isClaimed = item.status === 'claimed' || item.status === 'resolved';
            const phone = item.contactPhone || '+91 98765 43210';
            const cleanTel = (phone || '').replace(/[^0-9+]/g, '');
            const isOwner = user && (item.user?._id === user._id || item.user === user._id || user.role === 'admin');

            return (
              <div
                key={item._id}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition hover:shadow-md ${
                  isClaimed
                    ? 'border-slate-200 dark:border-slate-800 opacity-70'
                    : item.type === 'lost'
                    ? 'border-rose-200 dark:border-rose-900/60'
                    : 'border-emerald-200 dark:border-emerald-900/60'
                }`}
              >
                {/* Photo Preview if present */}
                {item.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase shadow-sm ${
                        item.type === 'lost'
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {item.type === 'lost' ? '🔍 Lost Item' : '📦 Found Item'}
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3" />
                      {item.dateOccurred || 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">Reported by</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                        {item.reporterName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {phone && (
                        <a
                          href={`tel:${cleanTel}`}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-600 hover:text-white transition"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Call</span>
                        </a>
                      )}

                      {!isClaimed && isOwner && (
                        <button
                          type="button"
                          onClick={() => handleMarkResolved(item._id)}
                          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition"
                        >
                          Mark Claimed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REPORT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Report Campus Lost or Found Item
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Help return misplaced property to IAR students and staff.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="mt-4 space-y-4">
              {/* Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: 'lost' }))}
                  className={`rounded-xl p-3 text-center border-2 text-xs font-bold transition ${
                    form.type === 'lost'
                      ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🔍 I Lost An Item
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: 'found' }))}
                  className={`rounded-xl p-3 text-center border-2 text-xs font-bold transition ${
                    form.type === 'found'
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  📦 I Found An Item
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Item Name / Title *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Blue Milton Water Bottle / Silver Titan Wristwatch"
                  value={form.title}
                  onChange={handleFormChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                  Description & Distinguishing Traits *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Describe scratches, brand, key ring attachments, or safe-keeping spot..."
                  value={form.description}
                  onChange={handleFormChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Campus Location *
                  </label>
                  <input
                    name="location"
                    required
                    placeholder="e.g. Library 2nd Floor / Canteen"
                    value={form.location}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Date Occurred
                  </label>
                  <input
                    name="dateOccurred"
                    type="date"
                    value={form.dateOccurred}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Contact Phone (For Recovery)
                  </label>
                  <input
                    name="contactPhone"
                    placeholder="+91 98765 43210"
                    value={form.contactPhone}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Item Photo: Drag & Drop Upload + URL Option */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Item Photo (Optional)
                  </label>

                  {/* Upload vs URL Tabs */}
                  <div className="flex items-center rounded-lg bg-slate-200/70 dark:bg-slate-700 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                        imageTab === 'upload'
                          ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      Drag & Drop / Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                        imageTab === 'url'
                          ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />

                {/* Preview Card when image is set */}
                {form.imageUrl ? (
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <img
                          src={form.imageUrl}
                          alt="Lost / Found preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>Photo Attached</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {uploadedFileName || 'Photo ready for report'}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={clearImage}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : imageTab === 'upload' ? (
                  /* Drag & Drop Area */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/60 scale-[1.01]'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-rose-400 hover:bg-rose-50/20 dark:hover:bg-rose-950/20'
                    }`}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-3">
                        <Loader2 className="h-7 w-7 animate-spin text-rose-600 dark:text-rose-400" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Uploading image to campus server...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-2">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          <span className="text-rose-600 dark:text-rose-400 underline">Click to upload</span> or drag and drop photo
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                          PNG, JPG, WEBP, or GIF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  /* Image URL input */
                  <div>
                    <input
                      name="imageUrl"
                      placeholder="https://images.unsplash.com/... or paste direct image URL"
                      value={form.imageUrl}
                      onChange={handleFormChange}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      Paste a direct image link from Unsplash, Imgur, or cloud storage.
                    </p>
                  </div>
                )}

                {imageError && (
                  <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                    {imageError}
                  </p>
                )}
              </div>

              {modalError && (
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">{modalError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 ${
                    form.type === 'lost' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting…' : 'Publish Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
