import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAssociations, getAllUnits } from "../ownershipApi";

const Card = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
    {title && (
      <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: "#EEF1F9" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>{title}</p>
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none disabled:bg-gray-50 disabled:opacity-60 bg-white transition";
const inputStyle = { "--tw-ring-color": "var(--color-primary)" };
const labelClass = "block text-sm font-medium text-gray-600 mb-1";

const emptyForm = {
  firstName: "", lastName: "", email: "", altEmail: "",
  phone: "", altPhone: "",
  primaryStreet: "", primaryCity: "", primaryState: "", primaryZip: "",
  altStreet: "", altCity: "", altState: "", altZip: "",
  isBoardMember: false, termStartDate: "", termEndDate: "",
  associationId: "", unitId: "",
};

const OwnershipAccountForm = ({ initialData = {}, onSubmit, loading, mode = "create" }) => {
  const navigate  = useNavigate();
  const seededRef = useRef(false);

  const [associations, setAssociations] = useState([]);
  const [allUnits, setAllUnits]         = useState([]);
  const [units, setUnits]               = useState([]);
  const [formData, setFormData]         = useState(emptyForm);

  useEffect(() => {
    getAllAssociations().then((r) => setAssociations(r.data?.data || [])).catch(console.error);
    getAllUnits()       .then((r) => setAllUnits(r.data?.data     || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (seededRef.current) return;
    if (!initialData || Object.keys(initialData).length === 0) return;
    setFormData({
      ...emptyForm,
      ...initialData,
      isBoardMember: Boolean(initialData.isBoardMember),
      unitId:        String(initialData.unitId        || ""),
      associationId: String(initialData.associationId || ""),
      termStartDate: initialData.termStartDate ? initialData.termStartDate.slice(0, 10) : "",
      termEndDate:   initialData.termEndDate   ? initialData.termEndDate.slice(0, 10)   : "",
    });
    seededRef.current = true;
  }, [initialData]);

  useEffect(() => {
    if (!formData.associationId) { setUnits([]); return; }
    setUnits(allUnits.filter((u) => String(u.associationId) === String(formData.associationId)));
  }, [formData.associationId, allUnits]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "associationId" ? { unitId: "" } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { associationId, termStartDate, termEndDate, isBoardMember, ...rest } = formData;
    const payload = {
      ...rest,
      unitId:        Number(formData.unitId),
      isBoardMember: Boolean(isBoardMember),
    };
    if (isBoardMember) {
      if (termStartDate) payload.termStartDate = new Date(termStartDate).toISOString();
      if (termEndDate)   payload.termEndDate   = new Date(termEndDate).toISOString();
    }
    onSubmit(payload);
  };

  const focusStyle = (e) => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = `0 0 0 2px ${"var(--color-primary)"}33`; };
  const blurStyle  = (e) => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">

      {/* Association & Unit */}
      <Card title={mode === "edit" ? "Association & Unit" : undefined}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Association <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <select name="associationId" value={formData.associationId} onChange={handleChange} required className={inputClass} onFocus={focusStyle} onBlur={blurStyle}>
              <option value="">Select Association</option>
              {associations.map((a) => <option key={a.id} value={String(a.id)}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Unit <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <select name="unitId" value={formData.unitId} onChange={handleChange} required disabled={!formData.associationId || units.length === 0} className={inputClass} onFocus={focusStyle} onBlur={blurStyle}>
              <option value="">
                {!formData.associationId ? "Select association first" : units.length === 0 ? "No units available" : "Select Unit"}
              </option>
              {units.map((u) => <option key={u.id} value={String(u.id)}>{u.unitNumber}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Owner Information */}
      <Card title="Owner Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required autoComplete="off" className={inputClass} placeholder="Enter first name" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label className={labelClass}>Last Name <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required autoComplete="off" className={inputClass} placeholder="Enter last name" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>
      </Card>

      {/* Primary Address */}
      <Card title="Primary Address">
        <div className="mb-4">
          <label className={labelClass}>Street Address</label>
          <input name="primaryStreet" value={formData.primaryStreet} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter street address" onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input name="primaryCity" value={formData.primaryCity} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter city" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input name="primaryState" value={formData.primaryState} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter state" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label className={labelClass}>ZIP Code</label>
            <input name="primaryZip" value={formData.primaryZip} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter ZIP code" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>
      </Card>

      {/* Alternative Address */}
      <Card title="Alternative Address (Optional)">
        <div className="mb-4">
          <label className={labelClass}>Street Address</label>
          <input name="altStreet" value={formData.altStreet} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter street address" onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input name="altCity" value={formData.altCity} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter city" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input name="altState" value={formData.altState} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter state" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label className={labelClass}>ZIP Code</label>
            <input name="altZip" value={formData.altZip} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter ZIP code" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>Email Address <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="off" className={inputClass} placeholder="Enter email address" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label className={labelClass}>Alternative Email Address</label>
            <input name="altEmail" type="email" value={formData.altEmail} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter alternative email" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone Number <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input name="phone" value={formData.phone} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="(555) 123-4567" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label className={labelClass}>Alternative Phone Number</label>
            <input name="altPhone" value={formData.altPhone} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="(555) 123-4567" onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>
      </Card>

      {/* Board Member Status */}
      <Card title="Board Member Status">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isBoardMember"
            checked={formData.isBoardMember === true}
            onChange={handleChange}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          <span className="text-sm text-gray-700">Owner is a Board Member</span>
        </label>
        {formData.isBoardMember && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Term Start Date</label>
              <input type="date" name="termStartDate" value={formData.termStartDate || ""} onChange={handleChange} className={inputClass} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div>
              <label className={labelClass}>Term End Date</label>
              <input type="date" name="termEndDate" value={formData.termEndDate || ""} onChange={handleChange} className={inputClass} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 pb-6">
        <button
          type="submit"
          disabled={loading}
          className="text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition hover:opacity-90"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {loading ? "Saving…" : mode === "edit" ? "Save Changes" : "Add Owner"}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default OwnershipAccountForm;