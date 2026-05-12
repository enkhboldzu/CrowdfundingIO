"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Lock, ArrowRight,
  Phone, Mail, User, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { registerUser } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

/* ─── helpers ─── */
function isPhoneInput(val: string) {
  return /^[\d\s+()-]{6,}$/.test(val.trim());
}

function passwordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)            score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9!@#$%^&*]/.test(pw)) score++;
  if (score === 1) return { level: 1, label: "Сул",     color: "bg-red-400"    };
  if (score === 2) return { level: 2, label: "Дунд",    color: "bg-yellow-400" };
  return              { level: 3, label: "Хүчтэй",  color: "bg-green-500"  };
}

/* ─── Logo (shared style with login) ─── */
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

/* ─── Custom checkbox ─── */
function Checkbox({
  checked, onChange, label, id,
}: { checked: boolean; onChange: (v: boolean) => void; label: React.ReactNode; id: string }) {
  return (
    <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer select-none group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={cn(
          "w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all duration-150",
          checked
            ? "bg-blue-700 border-blue-700"
            : "bg-white border-slate-300 group-hover:border-blue-400"
        )}>
          {checked && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 10" fill="none">
              <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-slate-600 leading-snug">{label}</span>
    </label>
  );
}

/* ─── Success screen ─── */
function SuccessScreen() {
  const router = useRouter();
  const [secs, setSecs] = useState(4);

  useEffect(() => {
    if (secs <= 0) { router.push("/login"); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs, router]);

  return (
    <div className="flex flex-col items-center text-center py-4 px-2">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
        <CheckCircle2 className="w-9 h-9 text-green-600" strokeWidth={1.8} />
      </div>
      <h2 className="font-display font-bold text-slate-900 text-2xl mb-2">
        Бүртгэл амжилттай!
      </h2>
      <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
        Таны бүртгэл үүслээ. {secs} секундын дараа нэвтрэх хуудас руу шилжинэ.
      </p>

      {/* Progress ring countdown */}
      <svg className="w-12 h-12 mb-6 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#E2E8F0" strokeWidth="3" />
        <circle
          cx="22" cy="22" r="18" fill="none"
          stroke="#2563EB" strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 18}`}
          strokeDashoffset={`${2 * Math.PI * 18 * (secs / 4)}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
        <text
          x="22" y="27"
          textAnchor="middle"
          className="rotate-90"
          style={{ fontSize: 13, fill: "#1E40AF", fontWeight: 700, transform: "rotate(90deg)", transformOrigin: "22px 22px" }}
        >
          {secs}
        </text>
      </svg>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-cta hover:shadow-lg transition-all hover:-translate-y-0.5"
      >
        Нэвтрэх хуудас руу очих
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

/* ─── Field error message ─── */
function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-red-600 text-xs mt-1.5 font-medium">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
      {msg}
    </p>
  );
}

/* ─── Password input ─── */
function PasswordInput({
  value, onChange, placeholder, autoComplete, show, onToggle, label, sublabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
  label: string;
  sublabel?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</label>
        {sublabel}
      </div>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label={show ? "Нуух" : "Харуулах"}
        >
          {show ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Main page
════════════════════════════════════════ */
export default function SignupPage() {
  const { login } = useAuth();

  /* form state */
  const [fullName,    setFullName]    = useState("");
  const [identifier,  setIdentifier]  = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms,       setTerms]       = useState(false);

  /* ui state */
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [touched,     setTouched]     = useState(false);
  const [serverError, setServerError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  /* derived */
  const inputPhone = isPhoneInput(identifier);
  const strength   = passwordStrength(password);

  /* ─── validation ─── */
  const errors = {
    fullName:   !fullName.trim()                   ? "Нэрээ оруулна уу."                        : "",
    identifier: !identifier.trim()                 ? "Имэйл эсвэл утасны дугаараа оруулна уу."  : "",
    password:   password.length < 8                ? "Нууц үг хамгийн багадаа 8 тэмдэгт байна." : "",
    confirm:    confirm !== password && confirm !== "" ? "Нууц үг зөрүүтэй байна."              :
                confirm === ""                      ? "Нууц үгийг давтана уу."                  : "",
    terms:      !terms                             ? "Үйлчилгээний нөхцөлийг зөвшөөрнө үү."     : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  /* live password-match check (show only after user starts typing confirm) */
  const confirmMismatch = confirm.length > 0 && confirm !== password;

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setTouched(true);
    if (hasErrors) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setLoading(true);

    const result = await registerUser({ name: fullName, identifier, password });

    if (!result.success) {
      setServerError(result.error ?? "Бүртгэхэд алдаа гарлаа.");
      setLoading(false);
      return;
    }

    login("user", { name: fullName });
    setLoading(false);
    setSubmitted(true);
  }

  function handleSocial(provider: "google") {
    window.location.href = `/api/auth/oauth/${provider}`;
  }

  /* scroll to top of card whenever submitted flips */
  useEffect(() => {
    if (submitted) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [submitted]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md" ref={topRef}>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">

          {/* Gradient accent bar */}
          <div className="h-1 gradient-brand" />

          <div className="px-8 py-8">
            <Logo />

            {submitted ? (
              <SuccessScreen />
            ) : (
              <>
                {/* Heading */}
                <div className="mb-6">
                  {/* Role badge */}
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <User className="w-3 h-3" strokeWidth={2.5} />
                    Хэрэглэгчийн бүртгэл
                  </div>
                  <h1 className="font-display font-bold text-slate-900 text-2xl mb-1">
                    Бүртгэл үүсгэх
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Тавтай морил! Бүртгэлтэй бол{" "}
                    <Link href="/login" className="text-blue-700 font-semibold hover:text-blue-900 transition-colors">
                      нэвтэрнэ үү
                    </Link>
                    .
                  </p>
                </div>

                {/* Global error banner */}
                {(serverError || (touched && hasErrors)) && (
                  <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span>{serverError || "Бүх талбарыг зөв бөглөнө үү."}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">

                  {/* Full name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Овог нэр
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Баатар Дорж"
                        autoComplete="name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400"
                      />
                    </div>
                    {touched && <FieldError msg={errors.fullName} />}
                  </div>

                  {/* Identifier */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                      Имэйл эсвэл Утасны дугаар
                    </label>
                    <div className="relative">
                      {inputPhone
                        ? <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
                        : <Mail  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
                      }
                      <input
                        type={inputPhone ? "tel" : "email"}
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="email@example.com эсвэл 9900-0000"
                        autoComplete="username"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400"
                      />
                    </div>
                    {touched && <FieldError msg={errors.identifier} />}
                  </div>

                  {/* Password */}
                  <div>
                    <PasswordInput
                      label="Нууц үг"
                      value={password}
                      onChange={setPassword}
                      placeholder="Хамгийн багадаа 8 тэмдэгт"
                      autoComplete="new-password"
                      show={showPw}
                      onToggle={() => setShowPw(v => !v)}
                    />
                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {([1, 2, 3] as const).map(n => (
                            <div
                              key={n}
                              className={cn(
                                "flex-1 h-1 rounded-full transition-all duration-300",
                                strength.level >= n ? strength.color : "bg-slate-200"
                              )}
                            />
                          ))}
                        </div>
                        {strength.label && (
                          <p className="text-xs text-slate-500">
                            Нууц үгийн хүч: <span className="font-semibold">{strength.label}</span>
                          </p>
                        )}
                      </div>
                    )}
                    {touched && <FieldError msg={errors.password} />}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <PasswordInput
                      label="Нууц үг давтах"
                      value={confirm}
                      onChange={setConfirm}
                      placeholder="Нууц үгийг давтан оруулна уу"
                      autoComplete="new-password"
                      show={showConfirm}
                      onToggle={() => setShowConfirm(v => !v)}
                    />
                    {/* Live mismatch — shown without needing submit */}
                    {confirmMismatch && <FieldError msg="Нууц үг зөрүүтэй байна." />}
                    {touched && !confirmMismatch && <FieldError msg={errors.confirm} />}
                  </div>

                  {/* Terms */}
                  <div>
                    <Checkbox
                      id="terms"
                      checked={terms}
                      onChange={setTerms}
                      label={
                        <>
                          <Link href="/terms" className="text-blue-700 font-semibold hover:underline">
                            Үйлчилгээний нөхцөл
                          </Link>
                          {" "}болон{" "}
                          <Link href="/privacy" className="text-blue-700 font-semibold hover:underline">
                            Нууцлалын бодлого
                          </Link>
                          -г зөвшөөрч байна.
                        </>
                      }
                    />
                    {touched && <FieldError msg={errors.terms} />}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 mt-2",
                      loading
                        ? "bg-blue-400 text-white cursor-not-allowed"
                        : "bg-blue-700 hover:bg-blue-800 text-white shadow-cta hover:shadow-lg hover:-translate-y-0.5"
                    )}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a8 8 0 00-8 8h4z"/>
                        </svg>
                        Бүртгэж байна...
                      </>
                    ) : (
                      <>
                        Бүртгүүлэх
                        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                      </>
                    )}
                  </button>

                </form>

                {/* Social divider */}
                <div className="relative flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium flex-shrink-0">эсвэл</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Social buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSocial("google")}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all duration-200 hover:border-slate-300 hover:shadow-sm disabled:opacity-60"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google-ээр бүртгүүлэх
                  </button>

                </div>

                {/* Bottom login link */}
                <p className="text-center text-sm text-slate-500 mt-7">
                  Бүртгэлтэй юу?{" "}
                  <Link href="/login" className="text-blue-700 font-bold hover:text-blue-900 transition-colors">
                    Нэвтрэх
                  </Link>
                </p>
              </>
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
