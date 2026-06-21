"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Lock, ChevronLeft, Save,
  Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, RefreshCw,
} from "lucide-react";

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || "https://central.buttoninks.com/wp-json";

// ── Tiny shared primitives ────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-['Inter']">{label}</label>
        {hint && <span className="text-[10px] text-zinc-400 font-['Inter']">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-zinc-900
        placeholder-zinc-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100
        transition-all font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}

type FeedbackKind = "success" | "error";
function Banner({ kind, message }: { kind: FeedbackKind; message: string }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold font-['Inter'] border ${
      kind === "success"
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-600 border-red-200"
    }`}>
      {kind === "success"
        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        : <AlertCircle   className="w-4 h-4 shrink-0 mt-0.5" />}
      <span>{message}</span>
    </div>
  );
}

function CardHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
      <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-green-700" />
      </div>
      <div>
        <h2 className="text-base font-bold text-zinc-900 font-['Outfit']">{title}</h2>
        <p className="text-xs text-zinc-400 font-['Inter']">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Password strength meter ───────────────────────────────────────────────────
function strengthScore(pw: string): number {
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const score = strengthScore(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500", "bg-green-700"];
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <span className={`text-xs font-semibold font-['Inter'] ${score <= 1 ? "text-red-500" : score <= 2 ? "text-orange-500" : "text-green-700"}`}>
        {labels[score] ?? ""}
      </span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AccountSettingsPage() {
  const router = useRouter();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [wpUserId,        setWpUserId]       = useState<number | null>(null);

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [username,  setUsername]  = useState("");

  // Password form
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  const [profileSaving,  setProfileSaving]  = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileFb,  setProfileFb]  = useState<{ kind: FeedbackKind; msg: string } | null>(null);
  const [passwordFb, setPasswordFb] = useState<{ kind: FeedbackKind; msg: string } | null>(null);

  // ── Fetch live WP profile ────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("bi_token");
    if (!token) { router.push("/login"); return; }

    setLoadingProfile(true);
    try {
      const res = await fetch(`${WP_API}/wp/v2/users/me?context=edit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error("Could not load profile.");
      const data = await res.json();
      setWpUserId(data.id);
      setFirstName(data.first_name ?? "");
      setLastName(data.last_name  ?? "");
      setEmail(data.email         ?? "");
      setUsername(data.username   ?? "");
    } catch {
      // WP unreachable — pre-fill from token-adjacent cache so form isn't blank
      const name  = localStorage.getItem("bi_user_name") ?? "";
      const em    = localStorage.getItem("bi_user_email") ?? "";
      const parts = name.trim().split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
      setEmail(em);
    } finally {
      setLoadingProfile(false);
    }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Save profile to WP ───────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFb(null);
    setProfileSaving(true);
    try {
      const token = localStorage.getItem("bi_token");
      const res = await fetch(`${WP_API}/wp/v2/users/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email }),
      });
      const data = await res.json();
      if (res.ok) {
        const full = `${data.first_name ?? firstName} ${data.last_name ?? lastName}`.trim();
        // Keep token-adjacent cache lightly in sync so account page renders fast
        localStorage.setItem("bi_user_name",  full);
        localStorage.setItem("bi_user_email", data.email ?? email);
        setProfileFb({ kind: "success", msg: "Profile saved successfully." });
      } else {
        throw new Error(data.message ?? "Failed to update profile.");
      }
    } catch (err: unknown) {
      setProfileFb({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change password on WP ────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFb(null);
    if (newPw !== confirmPw) { setPasswordFb({ kind: "error", msg: "Passwords do not match." }); return; }
    if (newPw.length < 8)    { setPasswordFb({ kind: "error", msg: "Password must be at least 8 characters." }); return; }

    setPasswordSaving(true);
    try {
      const token = localStorage.getItem("bi_token");
      const res = await fetch(`${WP_API}/wp/v2/users/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordFb({ kind: "success", msg: "Password changed! Signing you out to re-authenticate…" });
        setNewPw(""); setConfirmPw("");
        setTimeout(() => {
          localStorage.removeItem("bi_token");
          router.push("/login");
        }, 2500);
      } else {
        throw new Error(data.message ?? "Failed to change password.");
      }
    } catch (err: unknown) {
      setPasswordFb({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="w-full bg-green-700 pt-16 pb-32" />
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 -mt-16 flex flex-col gap-6">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-32 h-3.5 bg-gray-200 rounded" />
                  <div className="w-48 h-2.5 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="px-8 py-7 flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="h-12 bg-gray-100 rounded-xl" />
                  <div className="h-12 bg-gray-100 rounded-xl" />
                </div>
                <div className="h-12 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 pb-20">

      {/* Hero */}
      <div className="w-full bg-green-700 pt-12 sm:pt-16 pb-28 sm:pb-32 px-4 sm:px-6">
        <div className="max-w-[1280px] mx-auto flex items-center gap-3 text-sm">
          <Link href="/account" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors font-['Inter']">
            <ChevronLeft className="w-4 h-4" /> My Account
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white font-semibold font-['Inter']">Settings</span>
        </div>
        <div className="max-w-[1280px] mx-auto mt-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">Account Settings</h1>
            <p className="text-white/55 text-sm mt-1 font-['Inter']">
              {username ? `@${username} · ` : ""}Manage your profile and security.
            </p>
          </div>
          <button
            onClick={fetchProfile}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all shrink-0 font-['Inter']"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-[860px] mx-auto px-4 sm:px-6 -mt-16 flex flex-col gap-5 sm:gap-6">

        {/* ── Profile card ── */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <CardHeader icon={User} title="Personal Information" subtitle="Your name and email as stored in WordPress." />
          <form onSubmit={handleSaveProfile} className="px-6 sm:px-8 py-6 sm:py-7 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="First Name">
                <TextInput
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  autoComplete="given-name"
                />
              </Field>
              <Field label="Last Name">
                <TextInput
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </Field>
            </div>

            <Field label="Email Address" hint="Used for order notifications">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <TextInput
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </Field>

            {wpUserId && (
              <p className="text-[11px] text-zinc-400 font-['Inter']">
                WordPress User ID: <span className="font-mono font-semibold text-zinc-500">#{wpUserId}</span>
              </p>
            )}

            {profileFb && <Banner kind={profileFb.kind} message={profileFb.msg} />}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all active:scale-95 font-['Inter'] shadow-sm shadow-green-900/20"
              >
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </section>

        {/* ── Password card ── */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <CardHeader icon={Lock} title="Change Password" subtitle="Choose a strong password you don't use elsewhere." />
          <form onSubmit={handleChangePassword} className="px-6 sm:px-8 py-6 sm:py-7 flex flex-col gap-5">

            <Field label="New Password">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <TextInput
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-11"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                  aria-label="Toggle visibility"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar password={newPw} />
            </Field>

            <Field label="Confirm New Password">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <TextInput
                  type={showConf ? "text" : "password"}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  className={`pl-10 pr-11 ${confirmPw && confirmPw !== newPw ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                  aria-label="Toggle visibility"
                >
                  {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPw && confirmPw !== newPw && (
                <p className="text-xs text-red-500 font-['Inter'] mt-0.5">Passwords don&apos;t match yet.</p>
              )}
            </Field>

            {passwordFb && <Banner kind={passwordFb.kind} message={passwordFb.msg} />}

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-zinc-400 font-['Inter'] hidden sm:block">
                You&apos;ll be signed out after changing your password.
              </p>
              <button
                type="submit"
                disabled={passwordSaving}
                className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all active:scale-95 font-['Inter'] shadow-sm shadow-green-900/20 ml-auto"
              >
                {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          </form>
        </section>

      </div>
    </main>
  );
}
