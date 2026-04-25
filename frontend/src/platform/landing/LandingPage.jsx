import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🏦", title: "Accounting & Payments",    desc: "Chart of accounts, journal entries, bank reconciliation, bills management, and full financial reporting built for housing societies." },
  { icon: "🏘️", title: "Association Management",   desc: "Manage multiple associations, units, and ownership accounts. Track board members, set roles, and keep every stakeholder informed." },
  { icon: "💬", title: "Resident Communication",   desc: "Send emails and announcements to all residents, board members, or specific groups. Schedule or send instantly." },
  { icon: "📊", title: "Reports & Analytics",      desc: "Balance sheets, general ledger, income statements, and custom reports for informed committee decisions." },
  { icon: "🔧", title: "Maintenance Tracking",     desc: "Log maintenance requests, assign to vendors, track progress, and close work orders from one central dashboard." },
  { icon: "🔐", title: "Role-based Access",         desc: "Platform admin, tenant admin, and resident roles with granular permissions. Each user sees exactly what they need." },
];

const STEPS = [
  { num: "1", title: "Create Your Account",  desc: "Sign up in 30 seconds. No credit card required during your 14-day free trial." },
  { num: "2", title: "Set Up Your Society",  desc: "Add your association, units, and import resident data. We guide you every step." },
  { num: "3", title: "Invite Your Team",     desc: "Add committee members, accountants, and residents with the right roles and permissions." },
  { num: "4", title: "Go Live",              desc: "Start collecting dues, managing accounts, and communicating with residents instantly." },
];

const PLANS = [
  {
    name: "Starter", popular: false,
    desc: "Perfect for small societies just getting started.",
    priceBase: 999, priceComm: 1499,
    period: "per month · up to 50 units",
    features: ["Association Management", "Chart of Accounts", "Basic Accounting", "Up to 2 Admin Users", "Email Support"],
    cta: "Start Free Trial", ctaStyle: "outline",
  },
  {
    name: "Professional", popular: true,
    desc: "The complete solution for growing societies.",
    priceBase: 2499, priceComm: 3499,
    period: "per month · up to 200 units",
    features: ["Everything in Starter", "Full Accounting Suite", "Banking & Bills", "Reports & Analytics", "Up to 10 Admin Users", "Priority Support"],
    cta: "Start Free Trial", ctaStyle: "accent",
  },
  {
    name: "Enterprise", popular: false,
    desc: "For large societies and management companies.",
    priceBase: 5999, priceComm: 7999,
    period: "per month · unlimited units",
    features: ["Everything in Professional", "Multiple Associations", "Unlimited Admin Users", "Custom Reports", "Dedicated Account Manager", "SLA Guarantee"],
    cta: "Contact Sales", ctaStyle: "outline",
  },
];

const FAQS = [
  { q: "Is there a free trial?",               a: "Yes! Every plan comes with a 14-day free trial. No credit card required. Once your trial expires, you'll be redirected to choose a subscription plan to continue." },
  { q: "Can I manage multiple associations?",   a: "Yes. The Enterprise plan supports multiple associations under one account, each with its own units, residents, accounting, and reports." },
  { q: "What is the Communication module?",     a: "The Communication module lets you send emails and announcements to residents or board members. It includes scheduling, templates, and delivery tracking — available as an add-on." },
  { q: "How secure is my data?",                a: "We use bank-grade encryption and follow industry-standard security practices. Your data is hosted on secure cloud servers with regular backups and 99.9% uptime SLA." },
  { q: "Can I cancel anytime?",                 a: "Absolutely. No long-term contracts. Cancel your subscription at any time and your data remains accessible until the end of your billing period." },
  { q: "Do you offer customer support?",        a: "All plans include email support. Professional and Enterprise plans include priority support. Enterprise also includes a dedicated account manager." },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const NavBar = ({ navigate }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-[70px] bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "var(--color-primary)" }}>G</div>
      <span className="font-bold text-[17px]" style={{ color: "var(--color-primary)", fontFamily: "sans-serif" }}>GSTechSystem</span>
    </div>
    <ul className="hidden md:flex items-center gap-8 list-none">
      {["Features", "How It Works", "Pricing", "FAQ"].map((item) => (
        <li key={item}>
          <a href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] transition-colors no-underline">
            {item}
          </a>
        </li>
      ))}
    </ul>
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate("/login")}
        className="px-5 py-2 text-sm font-semibold rounded-lg border-2 transition-all"
        style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)", background: "transparent" }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--color-primary)"; e.currentTarget.style.color = "white"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-primary)"; }}
      >
        Sign In
      </button>
      <button
        onClick={() => navigate("/signup")}
        className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        Free Trial
      </button>
    </div>
  </nav>
);

const DashboardPreview = () => (
  <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ transform: "perspective(1000px) rotateY(-6deg) rotateX(2deg)" }}>
    {/* Topbar */}
    <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: "var(--color-primary)" }}>
      <div className="w-3 h-3 rounded-full bg-red-400" />
      <div className="w-3 h-3 rounded-full bg-yellow-400" />
      <div className="w-3 h-3 rounded-full bg-green-400" />
      <span className="ml-2 text-xs text-white/60">GSTechSystem — Dashboard</span>
    </div>
    {/* Body */}
    <div className="bg-gray-50 p-5">
      <p className="text-xs text-gray-400 mb-1">Good morning, Admin 👋</p>
      <p className="text-xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
        ₹12,450 <span className="text-sm font-normal text-gray-400">Outstanding</span>
      </p>
      {/* Mini cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Total Units", value: "248",    color: "var(--color-primary)" },
          { label: "Collected",   value: "₹8.2L",  color: "#16a34a"              },
          { label: "Overdue",     value: "₹1.4L",  color: "var(--color-danger)"  },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-lg p-2.5 border border-gray-200">
            <p className="text-[10px] text-gray-400 mb-1">{c.label}</p>
            <p className="text-sm font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
      {/* Rows */}
      {[
        { name: "A-101 · Rajesh Kumar", badge: "Paid",    cls: "bg-green-100 text-green-800" },
        { name: "B-203 · Priya Sharma", badge: "Pending", cls: "bg-yellow-100 text-yellow-800" },
        { name: "C-305 · Amit Singh",   badge: "Overdue", cls: "bg-red-100 text-red-700" },
        { name: "A-402 · Neha Gupta",   badge: "Paid",    cls: "bg-green-100 text-green-800" },
      ].map((row) => (
        <div key={row.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-xs">
          <span className="font-medium text-gray-700">{row.name}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${row.cls}`}>{row.badge}</span>
        </div>
      ))}
    </div>
  </div>
);

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="border rounded-xl overflow-hidden cursor-pointer transition-colors"
      style={{ borderColor: open ? "var(--color-primary)" : "#e5e7eb" }}
    >
      <div className="flex items-center justify-between px-6 py-5 font-semibold text-sm" style={{ color: "var(--color-primary)" }}>
        {q}
        <span className="text-xl transition-transform duration-200" style={{ transform: open ? "rotate(45deg)" : "none", color: "#16a34a" }}>+</span>
      </div>
      {open && <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{a}</div>}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [commEnabled, setCommEnabled] = useState(false);
  const [calcUnits, setCalcUnits]     = useState(100);
  const [calcComm, setCalcComm]       = useState(false);

  const calcPrice = () => {
    let base = calcUnits <= 50 ? 999 : calcUnits <= 200 ? 2499 : 5999;
    if (calcComm) base += 500;
    return `₹${base.toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <NavBar navigate={navigate} />

      {/* ── HERO ── */}
      <section
        className="min-h-screen flex items-center px-[5%] pt-28 pb-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1b4d 0%, var(--color-primary) 60%, #2a4a9e 100%)" }}
      >
        {/* glow */}
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #4C9E6E, transparent 70%)" }} />

        <div className="grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto w-full relative z-10">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border"
              style={{ background: "rgba(76,158,110,0.2)", borderColor: "rgba(76,158,110,0.4)", color: "#6EE7A4" }}>
              🏘️ Society Management Software
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Built to Keep Your<br />
              <span style={{ color: "#6EE7A4" }}>Society Running</span><br />
              Smoothly
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-9 max-w-lg">
              Run collections, accounting, maintenance, and resident communication on autopilot — all from one unified platform designed for housing societies.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button onClick={() => navigate("/signup")}
                className="px-8 py-4 text-base font-bold text-white rounded-xl transition hover:opacity-90"
                style={{ backgroundColor: "#4C9E6E" }}>
                Start Free Trial — 14 Days
              </button>
              <button onClick={() => document.getElementById("pricing").scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-4 text-base font-bold rounded-xl border-2 border-white text-white hover:bg-white/10 transition">
                View Pricing
              </button>
            </div>
            <div className="flex gap-10 pt-8 border-t border-white/10">
              {[["500+", "Societies Managed"], ["50k+", "Residents Served"], ["99.9%", "Uptime"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-3xl font-extrabold text-white">{n}</div>
                  <div className="text-xs text-white/50 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right — dashboard preview */}
          <div className="hidden md:block">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="flex flex-wrap items-center justify-center gap-10 px-[5%] py-6" style={{ backgroundColor: "var(--color-primary-light)" }}>
        {[["🔒","Bank-grade Security"],["☁️","Cloud-based Platform"],["📱","Mobile Friendly"],["⚡","99.9% Uptime SLA"],["🎯","No Setup Fees"]].map(([icon, label]) => (
          <div key={label} className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            <span className="text-xl">{icon}</span>{label}
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-[5%] bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: "#4C9E6E" }}>Platform Features</p>
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: "var(--color-primary)" }}>
              Every feature. All in <span style={{ color: "#4C9E6E" }}>one platform</span>.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              Everything your society committee needs — from accounting to communication — in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title}
                className="p-8 rounded-2xl border-2 border-gray-100 bg-white transition-all duration-200 hover:-translate-y-1 group"
                style={{ "--tw-shadow": "0 16px 40px rgba(26,43,107,0.1)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-primary)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#f3f4f6"}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ backgroundColor: "var(--color-primary-light)" }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: "var(--color-primary)" }}>{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-[5%]" style={{ backgroundColor: "var(--color-primary-light)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: "#4C9E6E" }}>Get Started</p>
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: "var(--color-primary)" }}>
              Up and running in <span style={{ color: "#4C9E6E" }}>minutes</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">No complex setup. No IT team required.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold text-white mx-auto mb-5 shadow-lg"
                  style={{ backgroundColor: "var(--color-primary)" }}>
                  {s.num}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: "var(--color-primary)" }}>{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-[5%] bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: "#4C9E6E" }}>Pricing</p>
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: "var(--color-primary)" }}>
              Plans for every <span style={{ color: "#4C9E6E" }}>stage of growth</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Simple, transparent pricing. No hidden fees. Cancel anytime.</p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-semibold ${!commEnabled ? "text-[var(--color-primary)]" : "text-gray-400"}`}>Without Communication</span>
            <button
              onClick={() => setCommEnabled(!commEnabled)}
              className="relative w-14 h-7 rounded-full transition-colors duration-200"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${commEnabled ? "translate-x-7" : ""}`} />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-2 ${commEnabled ? "text-[var(--color-primary)]" : "text-gray-400"}`}>
              With Communication
              <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: "#4C9E6E" }}>+Email</span>
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.name}
                className={`rounded-2xl p-9 border-2 relative transition-all duration-200 ${plan.popular ? "scale-105 shadow-2xl" : "border-gray-200 bg-white"}`}
                style={plan.popular ? { backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary)" } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: "#4C9E6E" }}>
                    Most Popular
                  </div>
                )}
                <h3 className={`text-lg font-bold mb-2 ${plan.popular ? "text-white" : ""}`} style={!plan.popular ? { color: "var(--color-primary)" } : {}}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 leading-relaxed ${plan.popular ? "text-white/60" : "text-gray-400"}`}>{plan.desc}</p>
                <div className={`pb-6 mb-6 border-b ${plan.popular ? "border-white/20" : "border-gray-200"}`}>
                  <div className={`text-4xl font-extrabold ${plan.popular ? "text-white" : ""}`} style={!plan.popular ? { color: "var(--color-primary)" } : {}}>
                    <sup className="text-xl align-top mt-2">₹</sup>
                    {(commEnabled ? plan.priceComm : plan.priceBase).toLocaleString("en-IN")}
                  </div>
                  <div className={`text-xs mt-1 ${plan.popular ? "text-white/50" : "text-gray-400"}`}>{plan.period}</div>
                </div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.popular ? "text-white/80 border-white/10" : "text-gray-600 border-gray-100"} border-b pb-2 last:border-0`}>
                      <span style={{ color: "#4C9E6E" }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/signup")}
                  className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
                  style={
                    plan.ctaStyle === "accent"
                      ? { backgroundColor: "#4C9E6E", color: "white" }
                      : plan.popular
                      ? { backgroundColor: "white", color: "var(--color-primary)" }
                      : { border: "2px solid var(--color-primary)", color: "var(--color-primary)", background: "transparent" }
                  }
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            🎉 All plans include a <button onClick={() => navigate("/signup")} className="font-semibold" style={{ color: "var(--color-primary)" }}>14-day free trial</button>. No credit card required. Once trial expires, you'll be redirected to choose a subscription.
          </p>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section className="py-24 px-[5%]" style={{ backgroundColor: "var(--color-primary-light)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: "#4C9E6E" }}>Calculate Your Price</p>
            <h2 className="text-4xl font-extrabold" style={{ color: "var(--color-primary)" }}>
              Find the right plan <span style={{ color: "#4C9E6E" }}>for your society</span>
            </h2>
          </div>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>Price Calculator</h3>
            <p className="text-gray-400 text-sm mb-8">Estimate your monthly cost based on your society's size and needs.</p>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-primary)" }}>Number of Units</label>
              <input
                type="number" value={calcUnits} min={1}
                onChange={(e) => setCalcUnits(parseInt(e.target.value) || 0)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none"
                style={{ "--tw-ring-color": "var(--color-primary)" }}
                onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--color-primary)" }}>Include Communication Module?</label>
              <select
                value={calcComm ? "yes" : "no"}
                onChange={(e) => setCalcComm(e.target.value === "yes")}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none"
                onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              >
                <option value="no">No — Accounting only</option>
                <option value="yes">Yes — Accounting + Communication</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-2xl p-6" style={{ backgroundColor: "var(--color-primary)" }}>
              <div>
                <div className="text-sm text-white/60 mb-1">Estimated Monthly Price</div>
                <div className="text-4xl font-extrabold text-white">{calcPrice()}</div>
              </div>
              <button onClick={() => navigate("/signup")}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
                style={{ backgroundColor: "#4C9E6E" }}>
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-[5%] bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[3px] mb-3" style={{ color: "#4C9E6E" }}>FAQ</p>
            <h2 className="text-4xl font-extrabold" style={{ color: "var(--color-primary)" }}>
              Frequently asked <span style={{ color: "#4C9E6E" }}>questions</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-[5%] text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1b4d, var(--color-primary))" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #4C9E6E, transparent 70%)" }} />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Start your <span style={{ color: "#6EE7A4" }}>free trial</span> today
          </h2>
          <p className="text-white/60 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            It takes just 30 seconds. No credit card required.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate("/signup")}
              className="px-10 py-4 text-base font-bold text-white rounded-xl transition hover:opacity-90"
              style={{ backgroundColor: "#4C9E6E" }}>
              Start My Free Trial
            </button>
            <button onClick={() => navigate("/login")}
              className="px-10 py-4 text-base font-bold rounded-xl border-2 border-white text-white hover:bg-white/10 transition">
              Sign In
            </button>
          </div>
          <p className="text-white/30 text-xs mt-5">By signing up, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-[5%] pt-16 pb-8" style={{ backgroundColor: "#0f1b4d", color: "rgba(255,255,255,0.5)" }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "var(--color-primary)" }}>G</div>
              <span className="font-bold text-white text-[17px]">GSTechSystem</span>
            </div>
            <p className="text-sm leading-relaxed">Purpose-built society management software for modern housing communities.</p>
          </div>
          {[
            { title: "Platform",  links: ["Features", "Pricing", "How It Works", "FAQ"]               },
            { title: "Product",   links: ["Accounting", "Banking", "Communication", "Reports"]         },
            { title: "Company",   links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-xs font-bold uppercase tracking-widest text-white mb-4">{col.title}</div>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}>
          <span>©2026 GSTechSystem. All rights reserved.</span>
          <span>Made with ❤️ for housing societies</span>
        </div>
      </footer>
    </div>
  );
}