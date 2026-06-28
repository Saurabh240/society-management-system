import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { Mail, Lock, User, Eye, EyeOff, Building2, Phone, Globe, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { signup, checkCompanyName } from "../../platform/auth/authService";

// ── Stepper indicator ─────────────────────────────────────────────────────────
function Stepper({ step }) {
  const steps = ["Account Setup", "Company Details"];
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((label, i) => {
        const active   = i === step;
        const complete = i < step;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${complete ? "bg-green-500 text-white"
                           : active  ? "bg-[var(--color-primary)] text-white"
                                     : "bg-gray-200 text-gray-500"}`}>
                {complete ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${active ? "text-[var(--color-primary)]" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 h-0.5 ${complete ? "bg-green-500" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Industry options ──────────────────────────────────────────────────────────
const INDUSTRY_OPTIONS = [
  { value: "", label: "Select industry (optional)" },
  { value: "HOA_MANAGEMENT",          label: "HOA Management"            },
  { value: "PROPERTY_MANAGEMENT",     label: "Property Management"       },
  { value: "COMMUNITY_ASSOCIATION",   label: "Community Association"     },
  { value: "OTHER",                   label: "Other"                     },
];

const COMPANY_SIZE_OPTIONS = [
  { value: "", label: "Select company size (optional)" },
  { value: "1-10",   label: "1–10 employees"    },
  { value: "11-50",  label: "11–50 employees"   },
  { value: "51-200", label: "51–200 employees"  },
  { value: "200+",   label: "200+ employees"    },
];

// ── Main component ────────────────────────────────────────────────────────────
const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = account, 1 = company

  useEffect(() => { document.title = "Sign Up | GSTechSystem"; }, []);

  // ── Step 1: Account fields ──────────────────────────────────────────────────
  const [account, setAccount] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  // ── Step 2: Company fields ──────────────────────────────────────────────────
  const [company, setCompany] = useState({
    companyName: "", industry: "", companySize: "", phone: "", website: "",
  });
  const [companyNameStatus, setCompanyNameStatus] = useState("idle"); // idle | checking | available | taken
  const debounceRef = useRef(null);

  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAccount = (e) => {
    setAccount((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const handleCompany = (e) => {
    const { name, value } = e.target;
    setCompany((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));

    if (name === "companyName") {
      setCompanyNameStatus("idle");
      clearTimeout(debounceRef.current);
      if (value.trim().length >= 2) {
        setCompanyNameStatus("checking");
        debounceRef.current = setTimeout(async () => {
          try {
            const available = await checkCompanyName(value.trim());
            setCompanyNameStatus(available ? "available" : "taken");
            if (!available) {
              setErrors((p) => ({ ...p, companyName: "Company name already taken" }));
            }
          } catch {
            setCompanyNameStatus("idle");
          }
        }, 500);
      }
    }
  };

  // ── Step 1 validation ───────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!account.firstName.trim())  e.firstName    = "First name is required";
    if (!account.lastName.trim())   e.lastName     = "Last name is required";
    if (!account.email)             e.email        = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email))
                                    e.email        = "Enter a valid email address";
    if (!account.password)          e.password     = "Password is required";
    else if (account.password.length < 8)
                                    e.password     = "Minimum 8 characters required";
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(account.password))
                                    e.password     = "Include uppercase, lowercase & number";
    if (!account.confirmPassword)   e.confirmPassword = "Please confirm your password";
    else if (account.password !== account.confirmPassword)
                                    e.confirmPassword = "Passwords do not match";
    return e;
  };

  // ── Step 2 validation (only companyName is required) ───────────────────────
  const validateStep2 = () => {
    const e = {};
    if (!company.companyName.trim()) e.companyName = "Company name is required";
    if (companyNameStatus === "taken") e.companyName = "Company name already taken";
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    setErrors(e);
    if (Object.keys(e).length === 0) setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validateStep2();
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    try {
      setLoading(true);
      await signup({
        firstName:    account.firstName.trim(),
        lastName:     account.lastName.trim(),
        email:        account.email.trim(),
        password:     account.password,
        companyName:  company.companyName.trim(),
        // Optional fields — only sent if filled in
        ...(company.phone   ? { phone:      company.phone.trim()   } : {}),
        ...(company.website ? { accountUrl: company.website.trim() } : {}),
      });
      navigate("/login", { state: { message: "Account created! Please log in." } });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Signup failed";
      if (msg.toLowerCase().includes("company")) {
        setErrors({ companyName: msg });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Company name indicator ──────────────────────────────────────────────────
  const companyNameHint = () => {
    if (companyNameStatus === "checking") return <span className="text-gray-400 text-xs">Checking availability…</span>;
    if (companyNameStatus === "available") return <span className="text-green-600 text-xs">✓ Name is available</span>;
    return null;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card padding="lg" shadow="lg" className="max-w-md w-full">
        <Card.Header className="text-center">
          <Card.Title>GSTechSystem</Card.Title>
          <Card.Description>Create your account to get started</Card.Description>
        </Card.Header>

        <Card.Content>
          <Stepper step={step} />

          {/* ── STEP 1: Account Setup ───────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              {errors.general && (
                <p className="text-red-500 text-sm text-center">{errors.general}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" name="firstName" placeholder="John"
                  value={account.firstName} onChange={handleAccount}
                  error={errors.firstName} leftIcon={<User size={16} />} />
                <Input label="Last Name" name="lastName" placeholder="Doe"
                  value={account.lastName} onChange={handleAccount}
                  error={errors.lastName} leftIcon={<User size={16} />} />
              </div>

              <Input label="Email Address" name="email" type="email" placeholder="john@example.com"
                value={account.email} onChange={handleAccount}
                error={errors.email} leftIcon={<Mail size={16} />} />

              <div className="relative">
                <Input label="Password" name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 chars, upper + lower + number"
                  value={account.password} onChange={handleAccount}
                  error={errors.password} leftIcon={<Lock size={16} />} />
                <button type="button"
                  className="absolute right-3 top-9 text-gray-500"
                  onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Input label="Confirm Password" name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  value={account.confirmPassword} onChange={handleAccount}
                  error={errors.confirmPassword} leftIcon={<Lock size={16} />} />
                <button type="button"
                  className="absolute right-3 top-9 text-gray-500"
                  onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <Button fullWidth onClick={handleNext} rightIcon={<ChevronRight size={16} />}>
                Continue to Company Setup
              </Button>
            </div>
          )}

          {/* ── STEP 2: Company Details ─────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <p className="text-red-500 text-sm text-center">{errors.general}</p>
              )}

              {/* Required */}
              <div>
                <Input label="Company Name" name="companyName" placeholder="e.g. Oakwood HOA"
                  value={company.companyName} onChange={handleCompany}
                  error={errors.companyName} leftIcon={<Building2 size={16} />}
                  required />
                <div className="mt-1 ml-1">{companyNameHint()}</div>
              </div>

              {/* Optional section */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 mb-3">
                  Optional — you can fill these in later from Settings
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Industry <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select name="industry" value={company.industry} onChange={handleCompany}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]">
                      {INDUSTRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Company Size <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select name="companySize" value={company.companySize} onChange={handleCompany}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]">
                      {COMPANY_SIZE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>

                  <Input label="Phone Number" name="phone" placeholder="+1 (555) 000-0000"
                    value={company.phone} onChange={handleCompany}
                    leftIcon={<Phone size={16} />}
                    helperText="Optional" />

                  <Input label="Website" name="website" placeholder="https://yourcompany.com"
                    value={company.website} onChange={handleCompany}
                    leftIcon={<Globe size={16} />}
                    helperText="Optional" />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="secondary" onClick={() => setStep(0)}
                  leftIcon={<ChevronLeft size={16} />} type="button">
                  Back
                </Button>
                <Button type="submit" fullWidth loading={loading} disabled={loading || companyNameStatus === "taken"}>
                  Create Account
                </Button>
              </div>
            </form>
          )}
        </Card.Content>

        <Card.Footer className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span className="text-blue-600 cursor-pointer" onClick={() => navigate("/login")}>
            Login
          </span>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Signup;