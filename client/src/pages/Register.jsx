import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Briefcase, CheckCircle, GraduationCap, MailCheck, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Register() {
  useDocumentTitle('Join Campus | CampusTrade - IAR Gandhinagar');

  const { sendVerificationCode, verifyCodeAndRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  // Step: 'form' (enter details) or 'verify' (enter 6-digit code)
  const [step, setStep] = useState('form');

  // Role Tab: 'student' or 'staff' (inspired by IAR ERP portal)
  const [roleTab, setRoleTab] = useState('student');

  const [form, setForm] = useState({
    name: '',
    email: '',
    campus: 'Institute of Advanced Research, Gandhinagar',
    // Student specific
    enrollmentNo: '',
    admissionYear: '',
    // Staff specific
    staffCode: '',
    department: '',
    designation: '',
    phone: '',
    // Credentials
    password: '',
    confirmPassword: '',
  });

  // Verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Valid institutional or personal Gmail address for OTP delivery
  const normalizedEmail = (form.email || '').trim().toLowerCase();
  const isValidEmail =
    normalizedEmail.endsWith('@iar.ac.in') ||
    normalizedEmail.endsWith('@gmail.com') ||
    normalizedEmail.endsWith('.edu') ||
    normalizedEmail.endsWith('.ac.in');

  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setError('');

    // Email requirement validation
    if (!isValidEmail) {
      setError('Please provide a valid official IAR email (@iar.ac.in) or Gmail address (@gmail.com).');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: normalizedEmail,
        role: roleTab,
        campus: 'Institute of Advanced Research, Gandhinagar',
        password: form.password,
      };

      if (roleTab === 'student') {
        payload.enrollmentNo = form.enrollmentNo.trim();
        payload.studentId = form.enrollmentNo.trim();
        payload.admissionYear = form.admissionYear ? Number(form.admissionYear) : undefined;
      } else {
        payload.staffCode = form.staffCode.trim();
        payload.department = form.department.trim();
        payload.designation = form.designation.trim();
        payload.phone = form.phone.trim();
      }

      await sendVerificationCode(payload);
      setStep('verify');
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    const cleanCode = verificationCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyCodeAndRegister(normalizedEmail, cleanCode);
      navigate(from);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: normalizedEmail,
        role: roleTab,
        campus: 'Institute of Advanced Research, Gandhinagar',
        password: form.password,
      };

      if (roleTab === 'student') {
        payload.enrollmentNo = form.enrollmentNo.trim();
        payload.admissionYear = form.admissionYear ? Number(form.admissionYear) : undefined;
      } else {
        payload.staffCode = form.staffCode.trim();
        payload.department = form.department.trim();
        payload.designation = form.designation.trim();
        payload.phone = form.phone.trim();
      }

      await sendVerificationCode(payload);
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-16 pb-28">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm sm:p-10">
        {step === 'form' ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
            </div>

            <div className="mt-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 px-3 py-0.5 text-xs font-bold uppercase text-blue-700 dark:text-blue-300">
                <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                {roleTab === 'student' ? '🎓 IAR Student Portal' : '💼 IAR Staff & Faculty Network'}
              </span>
              <h1 className="mt-3 text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Join Campus
              </h1>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Exclusively for Institute of Advanced Research (IAR) students, staff, and workers.
              </p>
            </div>

            {/* 2 Tabs: Student & Staff (Inspired by erp.iar.ac.in) */}
            <div className="mt-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                Select Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setRoleTab('student');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    roleTab === 'student'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleTab('staff');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    roleTab === 'staff'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  Staff
                </button>
              </div>
            </div>

            <form onSubmit={handleInitiateRegistration} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder={roleTab === 'student' ? 'e.g. Aarav Patel' : 'e.g. Dr. Rajesh Sharma'}
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Campus Email / Google Account <span className="text-red-500">*</span>
                  </label>
                  {form.email && (
                    <span
                      className={`text-[11px] font-bold ${
                        isValidEmail ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isValidEmail ? '✓ Valid Email Address' : 'Use @iar.ac.in or @gmail.com'}
                    </span>
                  )}
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={roleTab === 'student' ? 'e.g. yourname@iar.ac.in or student@gmail.com' : 'e.g. staff@iar.ac.in or name@gmail.com'}
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                />
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Enter your official <span className="font-bold text-slate-700 dark:text-slate-300">@iar.ac.in</span> university email or <span className="font-bold text-slate-700 dark:text-slate-300">@gmail.com</span>. A 6-digit OTP will be dispatched to this inbox for verification.
                </p>
              </div>

              {/* Student Fields */}
              {roleTab === 'student' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="enrollmentNo" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      ENROLLMENT NO.
                    </label>
                    <input
                      id="enrollmentNo"
                      name="enrollmentNo"
                      type="text"
                      placeholder="e.g. IAR/11111"
                      value={form.enrollmentNo}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="admissionYear" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      ADMISSION YEAR
                    </label>
                    <input
                      id="admissionYear"
                      name="admissionYear"
                      type="number"
                      min="2010"
                      max="2035"
                      placeholder="e.g. 2024"
                      value={form.admissionYear}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                    />
                  </div>
                </div>
              ) : (
                /* Staff Fields (Department & Designation Optional) */
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="staffCode" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        STAFF CODE / EMP ID
                      </label>
                      <input
                        id="staffCode"
                        name="staffCode"
                        type="text"
                        placeholder="e.g. IAR/EMP/042"
                        value={form.staffCode}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        DEPARTMENT <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="e.g. Computer Science, Admin"
                        value={form.department}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="designation" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        DESIGNATION <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        placeholder="e.g. Assistant Professor, Staff"
                        value={form.designation}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        MOBILE NO. <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={form.phone}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-700 dark:text-rose-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Sending Verification Code…'
                  : 'Send Verification Code to IAR Email'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* Step 2: Verification Code Screen */
          <div>
            <button
              type="button"
              onClick={() => {
                setStep('form');
                setError('');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to details
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto">
              <MailCheck className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-center text-2xl font-extrabold uppercase tracking-tight text-slate-900 dark:text-white">
              Verify Your Email
            </h2>

            <p className="mt-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
              A 6-digit verification code has been dispatched to:
            </p>
            <p className="mt-1 text-center font-bold text-sm text-blue-600 dark:text-blue-400">
              {normalizedEmail}
            </p>

            <div className="mt-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/40 p-3.5 text-center text-xs text-blue-900 dark:text-blue-200">
              <p className="font-semibold">
                Please check your Gmail / Email Inbox
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                If the email is not in your inbox after a few moments, please check your <strong>Spam / Junk</strong> folder or click Resend below.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="verificationCode"
                  className="block text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
                >
                  Enter 6-Digit Code
                </label>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center font-mono text-2xl font-extrabold tracking-[0.5em] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-600 transition"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-3 text-center text-xs font-semibold text-rose-700 dark:text-rose-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || verificationCode.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold uppercase text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming Code…' : 'Authenticate & Complete Registration'}
                <CheckCircle className="h-4 w-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSubmitting}
                  onClick={handleResendCode}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-slate-400 dark:disabled:text-slate-600 transition"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Did not receive code? Resend'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
