import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Lock, User, Mail, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'checking' | 'setup' | 'done' | 'locked'>('checking');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if setup is already done
  useEffect(() => {
    fetch(`${API}/auth/setup-status`)
      .then(r => r.json())
      .then(data => {
        if (!data.setupRequired) setStep('locked');
        else setStep('setup');
      })
      .catch(() => setStep('setup'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('পাসওয়ার্ড দুটো মিলছে না।');
      return;
    }
    if (form.password.length < 8) {
      setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/setup-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.setupDone) { setStep('locked'); return; }
        setError(data.message || 'কিছু একটা সমস্যা হয়েছে।');
        return;
      }

      setStep('done');
      setTimeout(() => navigate('/admin/dashboard'), 2500);
    } catch {
      setError('Server এর সাথে সংযোগ করা যাচ্ছে না। Backend চালু আছে কিনা দেখুন।');
    } finally {
      setLoading(false);
    }
  };

  // ── Checking state ──────────────────────────────────────────────────────────
  if (step === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950">
        <div className="text-white text-center animate-pulse">
          <School className="w-12 h-12 mx-auto mb-3 text-blue-400" />
          <p className="text-lg">সিস্টেম চেক হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // ── Already locked ──────────────────────────────────────────────────────────
  if (step === 'locked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 p-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 max-w-md w-full text-center text-white">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h2 className="text-2xl font-bold mb-2">Setup ইতিমধ্যে সম্পন্ন</h2>
          <p className="text-blue-200 mb-6">
            Admin অ্যাকাউন্ট আগেই তৈরি হয়েছে। এই পেজটি এখন লক করা আছে।
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all"
          >
            Admin Login এ যান →
          </button>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 p-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-10 max-w-md w-full text-center text-white">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-14 h-14 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">অ্যাকাউন্ট তৈরি হয়েছে! 🎉</h2>
          <p className="text-blue-200">Dashboard এ নিয়ে যাওয়া হচ্ছে...</p>
          <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full animate-[grow_2.5s_linear_forwards]" style={{ animation: 'width 2.5s linear forwards', width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Main Setup Form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <School className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">বালিয়াডাঙ্গা হাই হাব</h1>
          <p className="text-blue-300 font-medium">প্রথমবার Admin সেটআপ</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-6">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-amber-200 text-sm">
              এই পেজটি শুধুমাত্র একবার ব্যবহার করা যাবে। Admin তৈরি হলে এটি স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">
                প্রধান শিক্ষকের নাম
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="যেমন: শ্রী রামচন্দ্র দাস"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@baliadanga.edu.in"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">
                পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:bg-white/15 transition-all ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-400/60'
                      : 'border-white/20 focus:border-blue-400'
                  }`}
                />
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-red-400 text-xs mt-1">পাসওয়ার্ড মিলছে না</p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (!!form.confirm && form.confirm !== form.password)}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold text-base shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Admin অ্যাকাউন্ট তৈরি করুন
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Baliadanga High School Management System • Secure First-Run Setup
        </p>
      </div>
    </div>
  );
}
