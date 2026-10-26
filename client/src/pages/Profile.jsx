import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  Heart,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Package,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  User,
  UserX,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import axiosClient from '../api/axiosClient';
import TicketPassModal from '../components/TicketPassModal';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Profile() {
  useDocumentTitle('My Profile | CampusTrade');

  const navigate = useNavigate();
  const { user, updateProfile, deactivateAccount, deleteAccount } = useAuth();
  const { wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'academic' | 'security' | 'passes'
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Account Danger Zone States
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Activity stats
  const [listingsCount, setListingsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [myPasses, setMyPasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [selectedPassEvent, setSelectedPassEvent] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    campus: 'Institute of Advanced Research, Gandhinagar',
    bio: '',
    enrollmentNo: '',
    admissionYear: '',
    staffCode: '',
    department: '',
    designation: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Populate user data on mount / update
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        campus: user.campus || 'Institute of Advanced Research, Gandhinagar',
        bio: user.bio || '',
        enrollmentNo: user.enrollmentNo || user.studentId || '',
        admissionYear: user.admissionYear || user.gradYear || '',
        staffCode: user.staffCode || '',
        department: user.department || '',
        designation: user.designation || '',
      }));
    }
  }, [user]);

  // Fetch activity counts for buyer/seller summary
  useEffect(() => {
    axiosClient
      .get('/products/my')
      .then(({ data }) => setListingsCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setListingsCount(0));

    axiosClient
      .get('/orders/my')
      .then(({ data }) => setOrdersCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setOrdersCount(0));

    axiosClient
      .get('/events/my/passes')
      .then(({ data }) => setMyPasses(Array.isArray(data) ? data : []))
      .catch(() => setMyPasses([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // If attempting password update, validate matching passwords
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setErrorMsg('Please enter your current password to set a new password.');
        return;
      }
      if (formData.newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMsg('New password and confirm password do not match.');
        return;
      }
    }

    setIsSaving(true);

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        campus: formData.campus,
        bio: formData.bio,
        enrollmentNo: formData.enrollmentNo,
        studentId: formData.enrollmentNo,
        admissionYear: formData.admissionYear ? Number(formData.admissionYear) : undefined,
        staffCode: formData.staffCode,
        department: formData.department,
        designation: formData.designation,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined,
      });

      setSuccessMsg('Profile updated successfully! All changes are now live.');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setIsProcessingAction(true);
    setActionError('');
    try {
      await deactivateAccount();
      setShowDeactivateModal(false);
      navigate('/login?message=Account+deactivated+successfully');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to deactivate account.');
      setIsProcessingAction(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      setActionError('Please type "DELETE" to confirm account deletion.');
      return;
    }
    setIsProcessingAction(true);
    setActionError('');
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      navigate('/login?message=Account+deleted+permanently');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete account.');
      setIsProcessingAction(false);
    }
  };

  const isStaff = user?.role === 'staff';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 pb-28">
      {/* ------------------------------------------------------------- */}
      {/* PROFILE HEADER / CAMPUS IDENTITY CARD */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Circle with Institutional Initials */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl font-black text-white shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CT'}
              <div
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white dark:ring-slate-900"
                title="Verified Account"
              >
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>

            {/* Identity Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{user?.name}</h1>

                {/* Role Badge */}
                {isStaff ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Verified Staff / Faculty
                  </span>
                ) : user?.isVerifiedStudent ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Verified Student
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                    Verification In Progress
                  </span>
                )}
              </div>

              {/* Email & Contact Pill */}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                  <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  {user?.email}
                </span>

                {user?.phone && (
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {user?.phone}
                  </span>
                )}

                <span className="hidden sm:flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  Institute of Advanced Research, Gandhinagar
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Link to Sell */}
          <Link
            to="/my-listings"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            + Post Product Drop
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVITY & TRADING STATS OVERVIEW (BUYER & SELLER) */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Active Listings (Seller) */}
        <Link
          to="/my-listings"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              My Listings
            </span>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-2 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{listingsCount}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">active drops</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
            Manage listings →
          </p>
        </Link>

        {/* My Orders (Buyer) */}
        <Link
          to="/my-orders"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              My Orders
            </span>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{ordersCount}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">placed</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
            View orders →
          </p>
        </Link>

        {/* Wishlist Saved Items */}
        <Link
          to="/wishlist"
          className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Saved Items
            </span>
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-2 text-rose-500 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{wishlistCount}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">favorited</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 group-hover:underline">
            Open wishlist →
          </p>
        </Link>

        {/* Campus Trust Rating */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trust Score
            </span>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2 text-amber-500 dark:text-amber-400">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {user?.isVerifiedStudent ? '4.8' : '4.5'}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {user?.isVerifiedStudent ? '★★★★★' : '★★★★☆'}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {user?.isVerifiedStudent ? 'Verified IAR Member' : 'Campus Member'}
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PROFILE DETAILS & EDITING FORM */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-2 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <User className="h-4 w-4" />
            Personal & Contact
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'academic'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            {isStaff ? 'Staff & Department' : 'Academic & Student ID'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Lock className="h-4 w-4" />
            Password & Security
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('passes')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'passes'
                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <Ticket className="h-4 w-4" />
            Event Passes & RSVPs ({myPasses.length})
          </button>
        </div>

        {/* Feedback alerts */}
        <div className="px-6 pt-6">
          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs font-semibold text-red-700 dark:text-red-400">
              {errorMsg}
            </div>
          )}
        </div>

        {activeTab !== 'passes' ? (
          <form onSubmit={handleSave} className="p-6 pt-0 space-y-6">
          {/* TAB 1: PERSONAL & CONTACT */}
          {activeTab === 'personal' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                  />
                </div>

                {/* Mobile / Contact Number */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Mobile / Contact Number *
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Displayed on your listings so verified campus buyers can call you directly for handovers.
                  </p>
                </div>
              </div>

              {/* Preferred Campus Handover Spot */}
              <div>
                <label htmlFor="campus" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Preferred Campus Handover Spot
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500">
                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  <input
                    id="campus"
                    name="campus"
                    placeholder="e.g. IAR Central Library, Main Canteen, or Block-A Foyer"
                    value={formData.campus}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                  />
                </div>
              </div>

              {/* Bio / Seller Note */}
              <div>
                <label htmlFor="bio" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  About You / Seller Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  placeholder="Share a short note about your branch, department, or regular meetup hours (e.g. B.Tech Computer Science 3rd Year, free around 1-2 PM near Central Library)..."
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                />
              </div>
            </div>
          )}

          {/* TAB 2: INSTITUTIONAL / ACADEMIC */}
          {activeTab === 'academic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Institutional Email (Read-only anchor) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Institutional Email Address (Anchor)
                </label>
                <div className="mt-1.5 flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold">{user?.email}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Verified @iar.ac.in
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Institutional domain email is locked to protect campus student/staff authenticity.
                </p>
              </div>

              {/* If Student: Enrollment No & Admission Year */}
              {!isStaff ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="enrollmentNo"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Enrollment No. (e.g. IAR/11111)
                    </label>
                    <input
                      id="enrollmentNo"
                      name="enrollmentNo"
                      placeholder="IAR/11111"
                      value={formData.enrollmentNo}
                      onChange={handleChange}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 font-mono"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admissionYear"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Admission Year (e.g. 2024)
                    </label>
                    <input
                      id="admissionYear"
                      name="admissionYear"
                      type="number"
                      placeholder="2024"
                      value={formData.admissionYear}
                      onChange={handleChange}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                    />
                  </div>
                </div>
              ) : (
                /* If Staff: Staff Code, Department, Designation */
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="staffCode"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Staff Code / Employee ID
                    </label>
                    <input
                      id="staffCode"
                      name="staffCode"
                      placeholder="IAR/EMP/042"
                      value={formData.staffCode}
                      onChange={handleChange}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="department"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                      >
                        Department
                      </label>
                      <input
                        id="department"
                        name="department"
                        placeholder="e.g. Biotechnology & Bioengineering"
                        value={formData.department}
                        onChange={handleChange}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="designation"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                      >
                        Designation
                      </label>
                      <input
                        id="designation"
                        name="designation"
                        placeholder="e.g. Assistant Professor / Lab In-Charge"
                        value={formData.designation}
                        onChange={handleChange}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PASSWORD & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/40 p-4 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-blue-800 dark:text-blue-300">Campus Account Security:</span> To update your
                password, enter your current password followed by your desired new password.
              </div>

              {/* Current Password */}
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Current Password
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter existing password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3.5 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    New Password (Min 6 Characters)
                  </label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Create strong password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3.5 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-type new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
                  />
                </div>
              </div>

              {/* Danger Zone: Deactivate & Delete Account */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Account Status & Danger Zone
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Deactivate Account */}
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <h5 className="text-sm font-bold text-amber-900 dark:text-amber-200">Deactivate Account</h5>
                      </div>
                      <p className="mt-1.5 text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                        Temporarily suspend your account and hide your campus listings. You can contact support or sign in later to restore.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError('');
                        setShowDeactivateModal(true);
                      }}
                      className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-700 shadow-2xs transition"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      <span>Deactivate My Account</span>
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        <h5 className="text-sm font-bold text-rose-900 dark:text-rose-200">Permanently Delete Account</h5>
                      </div>
                      <p className="mt-1.5 text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
                        Permanently purge your account, verified campus student status, and all active listings. This action cannot be reversed.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError('');
                        setDeleteConfirmationText('');
                        setShowDeleteModal(true);
                      }}
                      className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-2xs transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Permanently Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
        ) : (
          <div className="p-6 pt-0 space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  My Campus Event & Campaign Passes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official digital passes for confirmed RSVPs and paid event registrations at IAR Gandhinagar.
                </p>
              </div>
              <Link
                to="/events"
                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Browse All Events</span>
              </Link>
            </div>

            {myPasses.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-12 px-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-3 border border-blue-200 dark:border-blue-900/50">
                  <Ticket className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">No Event Passes Claimed Yet</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  You haven't reserved tickets or RSVP'd to any campus events yet. Explore tech fests, research workshops, guest seminars, and blood donation drives happening at IAR.
                </p>
                <div className="mt-5">
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Explore Campus Events</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPasses.map((p, idx) => {
                  const ev = p.event || {};
                  return (
                    <div
                      key={p.ticketCode || p.passId || idx}
                      className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                          {ev.category || 'Event'}
                        </span>
                        <span className="font-mono text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                          {p.ticketCode}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {ev.title}
                        </h4>
                        <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>
                              {ev.eventDate
                                ? new Date(ev.eventDate).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Upcoming'}{' '}
                              • {ev.eventTime || '10:00 AM'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="line-clamp-1">
                              {ev.venue || 'Institute of Advanced Research Campus'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {p.ticketType === 'paid' ? 'Paid Ticket' : 'Confirmed Free Pass'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPass(p);
                            setSelectedPassEvent(ev);
                            setIsPassModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition"
                        >
                          <Ticket className="h-3.5 w-3.5" />
                          <span>View & Print Pass</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmed Digital Ticket Pass Modal */}
      <TicketPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        pass={selectedPass}
        event={selectedPassEvent}
      />

      {/* Deactivate Account Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-amber-200 dark:border-amber-900/80 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                  <UserX className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Deactivate Campus Account?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Temporary account freeze</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to deactivate your CampusTrade account? Your active listings will be hidden from the campus marketplace and you will be signed out immediately.
            </p>

            {actionError && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setShowDeactivateModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleDeactivateAccount}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition disabled:opacity-50"
              >
                {isProcessingAction ? 'Deactivating...' : 'Yes, Deactivate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-900/80 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Account Permanently?</h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Irreversible action</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will permanently delete your account, campus verification records, reviews, order history, and all published item listings. You cannot undo this.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Type <span className="text-rose-600 font-mono font-black">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {actionError && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAction || deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isProcessingAction ? 'Deleting...' : 'Delete Everything'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
