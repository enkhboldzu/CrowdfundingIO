"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye, EyeOff, Lock, ArrowRight,
  Phone, Mail, ShieldCheck, User,
} from "lucide-react";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { loginUser } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

/* ─── helpers ─── */
function isPhone(val: string) {
  return /^[\d\s+()-]{6,}$/.test(val.trim());
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  cancelled: "Social нэвтрэлт цуцлагдлаа.",
  config:    "Google нэвтрэлт server дээр тохируулагдаагүй байна.",
  failed:    "Social нэвтрэлт амжилтгүй боллоо. Дахин оролдоно уу.",
  provider:  "Social provider буруу байна.",
  state:     "Social нэвтрэлтийн хугацаа дууссан байна. Дахин оролдоно уу.",
};

/* ─── sub-components ─── */
function Logo() {
  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg font-display">CF</span>
      </div>
      <span className="font-display font-bold text-lg text-slate-900">
        crowdfund<span className="text-blue-600">.mn</span>
      </span>
    </div>
  );
}

interface RoleTabProps {
  role: UserRole;
  active: boolean;
  onClick: () => void;
}
function RoleTab({ role, active, onClick }: RoleTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
        active
          ? role === "admin"
            ? "bg-slate-900 text-white shadow-sm"
            : "bg-blue-700 text-white shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      )}
    >
      {role === "admin"
        ? <ShieldCheck className="w-4 h-4" strokeWidth={2} />
        : <User         className="w-4 h-4" strokeWidth={2} />}
      {role === "admin" ? "Админ" : "Хэрэглэгч"}
    </button>
  );
}

/* ─── main content (needs Suspense boundary for useSearchParams) ─── */
function LoginContent() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const initialRole: UserRole = searchParams.get("role") === "admin" ? "admin" : "user";

  const [role,       setRole]       = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [remember,   setRemember]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(() => {
    const oauthError = searchParams.get("oauth_error");
    return oauthError ? OAUTH_ERROR_MESSAGES[oauthError] ?? OAUTH_ERROR_MESSAGES.failed : "";
  });

  const inputPhone = isPhone(identifier);
  const inputEmail = identifier.includes("@");

  function validate() {
    if (!identifier.trim()) return role === "admin" ? "Нэр, имэйл эсвэл утасны дугаараа оруулна уу." : "Имэйл эсвэл утасны дугаараа оруулна уу.";
    if (!password.trim())   return "Нууц үгээ оруулна уу.";
    if (password.length < 6) return "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.";
    return "";
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setError("");
    setLoading(true);

    const result = await loginUser({ identifier, password, role });

    if (!result.success) {
      setError(result.error ?? "Нэвтрэхэд алдаа гарлаа.");
      setLoading(false);
      return;
    }

    login(result.role!, {
      name:   result.name  ?? "",
      email:  result.email ?? null,
      avatar: result.avatar ?? null,
    });
    const from = searchParams.get("from");
    const defaultDest = result.role === "admin" ? "/admin/dashboard" : "/";
    router.push(from && from.startsWith("/") ? from : defaultDest);
  }

  function handleSocial(provider: "google") {
    const params = new URLSearchParams();
    const from = searchParams.get("from");
    if (from?.startsWith("/")) params.set("from", from);
    const query = params.toString();

    window.location.href = `/api/auth/oauth/${provider}${query ? `?${query}` : ""}`;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* ── Card ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">

          {/* Thin gradient accent bar */}
          <div className="h-1 gradient-brand" />

          <div className="px-8 py-8">
            <Logo />

            {/* Role toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-7">
              <RoleTab role="user"  active={role === "user"}  onClick={() => { setRole("user");  setError(""); }} />
              <RoleTab role="admin" active={role === "admin"} onClick={() => { setRole("admin"); setError(""); }} />
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="font-display font-bold text-slate-900 text-2xl mb-1">
                {role === "admin" ? "Админ нэвтрэх" : "Тавтай морил!"}
              </h1>
              <p className="text-slate-500 text-sm">
                {role === "admin"
                  ? "Зөвхөн зөвшөөрөгдсөн хэрэглэгчид нэвтэрч болно."
                  : "Бүртгэлтэй хэрэглэгч шиг нэвтэрнэ үү."}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                <span className="mt-px text-red-400 flex-shrink-0">✕</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Identifier */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                  {role === "admin" ? "Нэр, имэйл эсвэл утасны дугаар" : "Имэйл эсвэл утасны дугаар"}
                </label>
                <div className="relative">
                  {inputPhone
                    ? <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
                    : role === "admin" && !inputEmail
                      ? <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
                      : <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
                  }
                  <input
                    type={inputPhone ? "tel" : role === "admin" ? "text" : "email"}
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={role === "admin" ? "admin_name, email@example.com эсвэл 9900-0000" : "email@example.com эсвэл 9900-0000"}
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Нууц үг
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    Нууц үгээ мартсан уу?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPw ? "Нуух" : "Харуулах"}
                  >
                    {showPw
                      ? <EyeOff className="w-4 h-4" strokeWidth={2} />
                      : <Eye    className="w-4 h-4" strokeWidth={2} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    "w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all duration-150",
                    remember
                      ? "bg-blue-700 border-blue-700"
                      : "bg-white border-slate-300 group-hover:border-blue-400"
                  )}>
                    {remember && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-600">Намайг сана</span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 mt-2",
                  loading
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : role === "admin"
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      : "bg-blue-700 hover:bg-blue-800 text-white shadow-cta hover:shadow-lg hover:-translate-y-0.5"
                )}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a8 8 0 00-8 8h4z"/>
                    </svg>
                    Нэвтэрч байна...
                  </>
                ) : (
                  <>
                    Нэвтрэх
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </>
                )}
              </button>

            </form>

            {/* Divider + social — only for user role */}
            {role === "user" && (
              <>
                <div className="relative flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium flex-shrink-0">эсвэл</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="space-y-3">
                  {/* Google */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSocial("google")}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-200 hover:border-slate-300 hover:shadow-sm disabled:opacity-60"
                  >
                    {/* Google "G" icon */}
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google-ээр нэвтрэх
                  </button>

                </div>
              </>
            )}

            {/* Bottom register link — user role only */}
            {role === "user" && (
              <p className="text-center text-sm text-slate-500 mt-7">
                Бүртгэлгүй юу?{" "}
                <Link
                  href="/signup"
                  className="text-blue-700 font-bold hover:text-blue-900 transition-colors"
                >
                  Бүртгүүлэх
                </Link>
              </p>
            )}

            {/* Admin has no self-service registration */}
            {role === "admin" && (
              <p className="text-center text-xs text-slate-400 mt-7">
                Бүртгүүлэх хүсэлтэй бол системийн администратортай холбогдоно уу.
              </p>
            )}
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-slate-400 mt-5 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd"/>
          </svg>
          256-bit SSL шифрлэлтээр хамгаалагдсан
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100" />}>
      <LoginContent />
    </Suspense>
  );
}
