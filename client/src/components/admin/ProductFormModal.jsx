import { useEffect, useRef, useState } from 'react';
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  CheckCircle,
  Sparkles,
  GraduationCap,
  RotateCcw,
  Tag,
  DollarSign,
  ShieldCheck,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const PRESET_IMAGES = [
  {
    label: '📚 Textbook',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🎯 Solved PYQs',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '📝 Handwritten Notes',
    url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🔬 Lab Manual / Coat',
    url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '💻 Tech / Gadget',
    url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '📐 Drafter / Calculator',
    url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '🚲 Campus Bicycle',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
  },
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Biotechnology',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Management & Commerce',
  'General Science / First Year',
];

const ACADEMIC_TYPES = [
  { id: 'general', label: 'General Item' },
  { id: 'textbook', label: '📚 Textbook' },
  { id: 'pyq', label: '🎯 Solved PYQs' },
  { id: 'notes', label: '📝 Handwritten Notes' },
  { id: 'manual', label: '🔬 Lab Manual & Record' },
  { id: 'lab_gear', label: '🥼 Lab Gear / Apron' },
];

const emptyForm = {
  title: '',
  description: '',
  price: '',
  originalMrp: '',
  category: '',
  stock: '1',
  imageUrl: '',
  condition: 'Good',
  campus: 'Institute of Advanced Research, Gandhinagar',
  listingType: 'buy', // 'buy' | 'rent' | 'giveaway'
  rentPricePerDay: '',
  rentDeposit: '',
  rentDurationDays: '3',
  isFreeGiveaway: false,
  department: '',
  semester: '',
  courseCode: '',
  academicType: 'general',
};

export default function ProductFormModal({ isOpen, mode, initialProduct, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Fair Price Suggestion state
  const [showAiPricing, setShowAiPricing] = useState(false);
  const [aiUsageAge, setAiUsageAge] = useState('one_sem'); // 'fresh' | 'one_sem' | 'two_plus'

  // Image Upload & Drag-and-Drop state
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (mode === 'edit' && initialProduct) {
      setForm({
        title: initialProduct.title || '',
        description: initialProduct.description || '',
        price: initialProduct.price ?? '',
        originalMrp: initialProduct.originalMrp ?? '',
        category: initialProduct.category || '',
        stock: initialProduct.stock ?? '1',
        imageUrl: initialProduct.imageUrl || '',
        condition: initialProduct.condition || 'Good',
        campus: initialProduct.campus || 'Institute of Advanced Research, Gandhinagar',
        listingType: initialProduct.listingType || (initialProduct.isFreeGiveaway ? 'giveaway' : 'buy'),
        rentPricePerDay: initialProduct.rentPricePerDay ?? '',
        rentDeposit: initialProduct.rentDeposit ?? '',
        rentDurationDays: initialProduct.rentDurationDays ?? '3',
        isFreeGiveaway: Boolean(initialProduct.isFreeGiveaway || initialProduct.price === 0),
        department: initialProduct.department || '',
        semester: initialProduct.semester ?? '',
        courseCode: initialProduct.courseCode || '',
        academicType: initialProduct.academicType || 'general',
      });
      setUploadedFileName(initialProduct.imageUrl ? 'Current product image' : '');
    } else {
      setForm(emptyForm);
      setUploadedFileName('');
    }
    setError('');
    setImageError('');
    setIsDragging(false);
    setIsUploadingImage(false);
    setShowAiPricing(false);
  }, [mode, initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleListingTypeSelect = (type) => {
    setForm((prev) => {
      const updated = { ...prev, listingType: type };
      if (type === 'giveaway') {
        updated.price = 0;
        updated.isFreeGiveaway = true;
      } else if (type === 'rent') {
        updated.isFreeGiveaway = false;
        if (!updated.rentPricePerDay) updated.rentPricePerDay = prev.price ? Math.round(Number(prev.price) * 0.1) : '30';
        if (!updated.rentDeposit) updated.rentDeposit = prev.price ? Math.round(Number(prev.price) * 0.6) : '200';
      } else {
        updated.isFreeGiveaway = false;
      }
      return updated;
    });
  };

  // AI Fair Price Suggestion Formula Engine
  // Strictly bounded: 10% min reduction to 40% max reduction based on time & usage
  const calculateAiPrice = () => {
    const mrp = Number(form.originalMrp);
    if (!mrp || mrp <= 0) return null;

    // Base reduction percent by condition (usage wear):
    // Brand New: 10% reduction
    // Like New: 18% reduction
    // Good: 26% reduction
    // Fair: 34% reduction
    const conditionReductions = {
      'Brand New': 10,
      'Like New': 18,
      Good: 26,
      Fair: 34,
    };
    const baseReduction = conditionReductions[form.condition] ?? 26;

    // Additional reduction percent by time elapsed (semesters used):
    // fresh (<6 months): +0%
    // one_sem (1 sem used): +3%
    // two_plus (2+ sems used): +6%
    const ageReductions = {
      fresh: 0,
      one_sem: 3,
      two_plus: 6,
    };
    const ageAddition = ageReductions[aiUsageAge] ?? 3;

    // Total reduction strictly clamped between 10% min and 40% max
    const totalReduction = Math.min(Math.max(baseReduction + ageAddition, 10), 40);

    // Calculated selling price based on exact reduction
    const rawCalculated = mrp * (1 - totalReduction / 100);

    // Clean price formatting based on price magnitude
    let calculated;
    if (mrp <= 50) {
      // Cheap items (pens, notebooks, charts): round to nearest whole rupee, min ₹1
      calculated = Math.max(Math.round(rawCalculated), 1);
    } else if (mrp <= 200) {
      // Medium items: round to nearest 5 rupees, min ₹5
      calculated = Math.max(Math.round(rawCalculated / 5) * 5, 5);
    } else {
      // High-value items: round to nearest 10 rupees, min ₹10
      calculated = Math.max(Math.round(rawCalculated / 10) * 10, 10);
    }

    // Strict boundary enforcement: exactly 10% min reduction, 40% max reduction
    const minPrice = Math.max(Math.round(mrp * 0.60), 1); // 40% max reduction
    const maxPrice = Math.max(Math.round(mrp * 0.90), 1); // 10% min reduction
    calculated = Math.min(Math.max(calculated, minPrice), maxPrice);

    // Fair range (bounded within [minPrice, maxPrice]):
    const minRange = Math.max(Math.min(Math.round(calculated * 0.94), calculated), minPrice);
    const maxRange = Math.min(Math.max(Math.round(calculated * 1.06), calculated), maxPrice);

    const actualReduction = Math.round(((mrp - calculated) / mrp) * 100);

    return {
      suggested: calculated,
      min: minRange,
      max: maxRange,
      savingsPercent: actualReduction,
      totalReduction,
    };
  };

  const aiPriceResult = calculateAiPrice();

  const applyAiPrice = () => {
    if (aiPriceResult) {
      setForm((prev) => ({
        ...prev,
        price: aiPriceResult.suggested,
      }));
    }
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
      // Fallback: convert to base64 Data URL so offline/buffered operations never fail
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setForm((prev) => ({ ...prev, imageUrl: e.target.result }));
        }
      };
      reader.readAsDataURL(file);
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
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    setUploadedFileName('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectPresetImage = (url, label) => {
    setForm((prev) => ({ ...prev, imageUrl: url }));
    setUploadedFileName(label);
    setImageError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.imageUrl) {
      setError('Please upload a product photo or select a campus photo.');
      return;
    }

    setIsSubmitting(true);

    const isGiveaway = form.listingType === 'giveaway';
    const payload = {
      ...form,
      price: isGiveaway ? 0 : Number(form.price),
      originalMrp: Number(form.originalMrp) || 0,
      stock: Number(form.stock) || 1,
      rentPricePerDay: form.listingType === 'rent' ? Number(form.rentPricePerDay) || 0 : 0,
      rentDeposit: form.listingType === 'rent' ? Number(form.rentDeposit) || 0 : 0,
      rentDurationDays: form.listingType === 'rent' ? Number(form.rentDurationDays) || 1 : 1,
      isFreeGiveaway: isGiveaway,
      semester: form.semester ? Number(form.semester) : null,
      courseCode: (form.courseCode || '').toUpperCase().trim(),
    };

    try {
      if (mode === 'edit') {
        await axiosClient.put(`/products/${initialProduct._id}`, payload);
      } else {
        await axiosClient.post('/products', payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4 py-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {mode === 'edit' ? 'Edit Campus Listing' : 'Post New Campus Listing'}
              {form.listingType === 'giveaway' && (
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                  🎓 Senior Giveaway
                </span>
              )}
              {form.listingType === 'rent' && (
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                  🔄 Rental / Borrow
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Institute of Advanced Research, Gandhinagar Verified Student Marketplace
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* ------------------------------------------------------------- */}
          {/* LISTING TYPE SELECTOR (Category A & D: Buy vs Rent vs Giveaway) */}
          {/* ------------------------------------------------------------- */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Listing Mode *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleListingTypeSelect('buy')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center transition-all ${
                  form.listingType === 'buy'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 text-blue-900 dark:text-blue-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Tag className="h-5 w-5 mb-1.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold">Buy / Sell</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Direct permanent trade</span>
              </button>

              <button
                type="button"
                onClick={() => handleListingTypeSelect('rent')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center transition-all ${
                  form.listingType === 'rent'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 dark:border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <RotateCcw className="h-5 w-5 mb-1.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold">Rent / Borrow</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Per-day + Refundable deposit</span>
              </button>

              <button
                type="button"
                onClick={() => handleListingTypeSelect('giveaway')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 text-center transition-all ${
                  form.listingType === 'giveaway'
                    ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <GraduationCap className="h-5 w-5 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold">🎓 Senior Giveaway</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">100% Freecycle (₹0)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Listing Title *
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. Calculus: Early Transcendentals / Casio fx-991EX / CS201 Solved Papers"
              value={form.title}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description & Details *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              placeholder="Describe condition, highlights, rental terms, or course syllabus coverage..."
              value={form.description}
              onChange={handleChange}
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category *
              </label>
              <input
                id="category"
                name="category"
                required
                list="category-suggestions"
                placeholder="e.g. Textbooks"
                value={form.category}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
              />
              <datalist id="category-suggestions">
                <option value="Textbooks" />
                <option value="Electronics" />
                <option value="Lab Coats" />
                <option value="Stationery" />
                <option value="Dorm Gear" />
                <option value="Study Notes" />
              </datalist>
            </div>

            <div>
              <label htmlFor="condition" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Condition *
              </label>
              <select
                id="condition"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
              >
                <option value="Brand New">Brand New (Unused)</option>
                <option value="Like New">Like New (Barely used)</option>
                <option value="Good">Good (Normal wear)</option>
                <option value="Fair">Fair (Readable / functional)</option>
              </select>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PRICING & RENTAL DETAILS */}
          {/* ------------------------------------------------------------- */}
          {form.listingType === 'giveaway' ? (
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 p-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Senior Giveaway & Freecycle: Price locked at ₹0 (FREE)
              </div>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300/80">
                Passing your gear to juniors strengthens the campus community and prevents landfill waste.
              </p>
            </div>
          ) : form.listingType === 'rent' ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                <RotateCcw className="h-4 w-4" />
                Rental & Borrowing Parameters
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="rentPricePerDay" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Rent Rate (₹/day) *
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      id="rentPricePerDay"
                      name="rentPricePerDay"
                      type="number"
                      min="0"
                      required
                      placeholder="40"
                      value={form.rentPricePerDay}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-7 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rentDeposit" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Refundable Deposit (₹) *
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      id="rentDeposit"
                      name="rentDeposit"
                      type="number"
                      min="0"
                      required
                      placeholder="300"
                      value={form.rentDeposit}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-7 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="rentDurationDays" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Est. Loan Days *
                  </label>
                  <input
                    id="rentDurationDays"
                    name="rentDurationDays"
                    type="number"
                    min="1"
                    required
                    value={form.rentDurationDays}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/80 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                Security deposit is refunded back to borrower when item is safely handed back.
              </p>
            </div>
          ) : (
            /* Buy / Sell Standard Pricing */
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Selling Price (₹ INR) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAiPricing(!showAiPricing)}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Sparkles className="h-3 w-3" />
                    {showAiPricing ? 'Hide AI Engine' : 'AI Price Assistant'}
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400 dark:text-slate-500">₹</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="350"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 pl-8 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Quantity Available *
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={form.stock}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                />
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* AI FAIR-PRICE SUGGESTION ENGINE (Category E - #11) */}
          {/* ------------------------------------------------------------- */}
          {showAiPricing && form.listingType === 'buy' && (
            <div className="rounded-2xl border border-blue-200 dark:border-blue-800/70 bg-blue-50/40 dark:bg-blue-950/30 p-4 transition-all">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  AI Fair-Price Suggestion Engine
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                    10%–40% Reduction Scale
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAiPricing(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-blue-100/60 dark:hover:bg-blue-900/40 transition"
                    title="Hide AI Engine"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label htmlFor="originalMrp" className="block font-semibold text-slate-700 dark:text-slate-300">
                    Original MRP Printed (₹)
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      id="originalMrp"
                      name="originalMrp"
                      type="number"
                      placeholder="e.g. 950"
                      value={form.originalMrp}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-7 pr-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Usage Age / Semesters
                  </label>
                  <select
                    value={aiUsageAge}
                    onChange={(e) => setAiUsageAge(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="fresh">Fresh purchase (&lt;6 months)</option>
                    <option value="one_sem">1 Semester used</option>
                    <option value="two_plus">2+ Semesters used</option>
                  </select>
                </div>
              </div>

              {aiPriceResult ? (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 p-3 border border-blue-200/80 dark:border-blue-900/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Recommended: ₹{aiPriceResult.suggested}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        (Fair range: ₹{aiPriceResult.min} - ₹{aiPriceResult.max})
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Saves campus buyer {aiPriceResult.savingsPercent}% off original MRP ({aiPriceResult.savingsPercent}% reduction based on {form.condition} / {aiUsageAge.replace('_', ' ')})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={applyAiPrice}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Apply Price
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Enter original MRP above to calculate fair student pricing based on condition & depreciation.
                </p>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* ACADEMIC SYLLABUS & COURSE TAGGING (Category B - #4 & D - #9) */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Academic Tagging (Syllabus, PYQs & Notes)
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Helps peers find exam & course materials
              </span>
            </div>

            {/* Academic Resource Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Resource Vertical
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ACADEMIC_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, academicType: type.id }))}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      form.academicType === type.id
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Department */}
              <div className="col-span-2">
                <label htmlFor="department" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Academic Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Select Department (Optional)</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Semester
                </label>
                <select
                  id="semester"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Any</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                      Sem {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Code */}
            <div>
              <label htmlFor="courseCode" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Course Code (e.g. CS201, BT204, MA101, EE102)
              </label>
              <input
                id="courseCode"
                name="courseCode"
                placeholder="e.g. CS201"
                value={form.courseCode}
                onChange={(e) => setForm((prev) => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
                className="mt-1 w-full uppercase font-mono tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Campus Meetup Location */}
          <div>
            <label htmlFor="campus" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Campus Handover / Meetup Spot
            </label>
            <input
              id="campus"
              name="campus"
              placeholder="e.g. IAR Central Library, Canteen, or Block-A Foyer"
              value={form.campus}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            />
          </div>

          {/* ------------------------------------------------------------- */}
          {/* PRODUCT IMAGE UPLOAD / DRAG-AND-DROP SYSTEM */}
          {/* ------------------------------------------------------------- */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Product Photo *
              </label>

              {/* Upload vs URL Tabs */}
              <div className="flex items-center rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                    imageTab === 'upload'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
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
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
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

            {/* If an image is selected / active, show Preview Card */}
            {form.imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <img
                      src={form.imageUrl}
                      alt="Product preview"
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
                      {uploadedFileName || 'Ready for listing'}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={clearImage}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : imageTab === 'upload' ? (
              /* Drag-and-Drop Area */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/30'
                }`}
              >
                {isUploadingImage ? (
                  <div className="flex flex-col items-center py-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">Uploading product photo...</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-full bg-blue-50 dark:bg-blue-950/50 p-3 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/50">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Drag & drop your product photo here, or{' '}
                      <span className="text-blue-600 dark:text-blue-400 underline">browse device</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Supports PNG, JPG, JPEG, WEBP up to 10MB
                    </p>
                  </>
                )}
              </div>
            ) : (
              /* Image URL Input */
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500">
                    <LinkIcon className="h-4 w-4" />
                  </span>
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://images.unsplash.com/... or any photo link"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                  />
                </div>
              </div>
            )}

            {imageError && (
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">{imageError}</p>
            )}

            {/* Quick Preset Campus Photo Suggestions */}
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span>Or select a sample campus photo:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => selectPresetImage(preset.url, preset.label)}
                    className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-colors shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 ${
                form.listingType === 'giveaway'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : form.listingType === 'rent'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting
                ? 'Saving Listing...'
                : mode === 'edit'
                ? 'Save Changes'
                : form.listingType === 'giveaway'
                ? '🎓 Post Free Giveaway'
                : form.listingType === 'rent'
                ? '🔄 Publish Rental Listing'
                : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
