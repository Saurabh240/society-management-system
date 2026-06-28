import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Zap, Building2 } from "lucide-react";
import { toast } from "react-toastify";
import { selectPlan } from "./planApi";

const PLANS = [
  {
    key:         "FREE",
    title:       "Free Trial",
    subtitle:    "Test data only",
    icon:        <Zap size={28} className="text-amber-500" />,
    color:       "border-gray-200",
    badgeColor:  "bg-amber-50 text-amber-700",
    badge:       "No Credit Card",
    recommended: false,
    price:       "Free",
    priceNote:   "15 units included",
    features: [
      { ok: true,  text: "15 units included"         },
      { ok: true,  text: "All features available"    },
      { ok: true,  text: "No credit card required"   },
      { ok: false, text: "Real data disabled"        },
      { ok: false, text: "For testing purposes only" },
    ],
    btnLabel: "Select Free Trial",
    btnClass: "bg-gray-800 hover:bg-gray-700 text-white",
  },
  {
    key:         "STANDARD",
    title:       "Standard",
    subtitle:    "Live data — production ready",
    icon:        <Building2 size={28} className="text-[var(--color-primary)]" />,
    color:       "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]",
    badgeColor:  "bg-blue-50 text-blue-700",
    badge:       "Recommended",
    recommended: true,
    price:       "Free",
    priceNote:   "First 15 units • $1/unit after",
    features: [
      { ok: true, text: "15 units FREE"             },
      { ok: true, text: "$1/unit/month after 15"    },
      { ok: true, text: "All features available"    },
      { ok: true, text: "Real production data"      },
      { ok: true, text: "Cancel anytime"            },
    ],
    btnLabel: "Select Standard",
    btnClass: "bg-[var(--color-primary)] hover:opacity-90 text-white",
  },
];

export default function PlanSelectionPage() {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(null); // null | "FREE" | "STANDARD"

  const handleSelect = async (planKey) => {
    try {
      setLoading(planKey);
      await selectPlan(planKey);
      localStorage.setItem("planSelected", "true");

      if (planKey === "STANDARD") {
        toast.success("Standard plan activated! Payment setup coming soon.");
      } else {
        toast.success("Free trial activated! You have 15 units to explore.");
      }
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Failed to select plan. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">

      {/* Header */}
      <div className="text-center mb-10 max-w-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-500">
          Pick the plan that fits your needs. You can upgrade or change your plan anytime from Settings.
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {PLANS.map((plan) => (
          <div key={plan.key}
            className={`bg-white rounded-2xl border-2 p-6 flex flex-col shadow-sm transition-shadow hover:shadow-md ${plan.color}`}>

            {/* Badge */}
            <div className="flex justify-between items-start mb-4">
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${plan.badgeColor}`}>
                {plan.badge}
              </div>
              {plan.icon}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900">{plan.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-4">{plan.subtitle}</p>

            {/* Price */}
            <div className="mb-5">
              <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
              <span className="text-sm text-gray-500 ml-2">{plan.priceNote}</span>
            </div>

            {/* Features */}
            <ul className="space-y-2 flex-1 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  {f.ok
                    ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    : <XCircle    size={16} className="text-red-400 flex-shrink-0" />}
                  <span className={f.ok ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => handleSelect(plan.key)}
              disabled={loading !== null}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${plan.btnClass}`}>
              {loading === plan.key ? "Setting up…" : plan.btnLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Pricing note */}
      <div className="mt-8 max-w-xl text-center">
        <p className="text-xs text-gray-400">
          Standard plan: First 15 units are always free.
          Each additional unit costs <strong>$1/month</strong>.
          <br />
          Example: 20 units = $5/month · 50 units = $35/month.
        </p>
      </div>
    </div>
  );
}