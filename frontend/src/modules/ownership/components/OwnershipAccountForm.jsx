import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAssociations, getAllUnits } from "../ownershipApi";

const Card = ({ children }) => (
  <div className="border border-gray-200 rounded-lg p-5 mb-4">{children}</div>
);

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-50 disabled:opacity-60 bg-white";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const sectionClass = "text-sm font-semibold text-gray-800 mb-4";

const emptyForm = {
  firstName: "", lastName: "", email: "", altEmail: "",
  phone: "", altPhone: "",
  primaryStreet: "", primaryCity: "", primaryState: "", primaryZip: "",
  altStreet: "", altCity: "", altState: "", altZip: "",
  isBoardMember: false, termStartDate: "", termEndDate: "",
  associationId: "", unitId: "",
};

const OwnershipAccountForm = ({ initialData = {}, onSubmit, loading, mode = "create" }) => {
  const navigate       = useNavigate();
  const seededRef      = useRef(false);

  const [associations, setAssociations] = useState([]);
  const [allUnits, setAllUnits]         = useState([]);
  const [units, setUnits]               = useState([]);
  const [formData, setFormData]         = useState(emptyForm);

  // Load dropdowns once
  useEffect(() => {
    getAllAssociations()
      .then((res) => setAssociations(res.data?.data || []))
      .catch(console.error);
    getAllUnits()
      .then((res) => setAllUnits(res.data?.data || []))
      .catch(console.error);
  }, []);

  // Seed from initialData exactly once (edit mode)
  useEffect(() => {
    if (seededRef.current) return;
    if (!initialData || Object.keys(initialData).length === 0) return;
    setFormData({
      ...emptyForm,
      ...initialData,
      unitId:        String(initialData.unitId        || ""),
      associationId: String(initialData.associationId || ""),
    });
    seededRef.current = true;
  }, [initialData]);

  // Filter units when association changes
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
    const { associationId, ...payload } = formData;
    onSubmit({ ...payload, unitId: Number(formData.unitId) });
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">

      {/* Association & Unit */}
      <Card>
        {mode === "edit" && <p className={sectionClass}>Association & Unit</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Association <span className="text-red-500">*</span></label>
            <select name="associationId" value={formData.associationId} onChange={handleChange} required className={inputClass}>
              <option value="">Select Association</option>
              {associations.map((a) => <option key={a.id} value={String(a.id)}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Unit <span className="text-red-500">*</span></label>
            <select name="unitId" value={formData.unitId} onChange={handleChange} required disabled={!formData.associationId || units.length === 0} className={inputClass}>
              <option value="">Select Unit</option>
              {units.map((u) => <option key={u.id} value={String(u.id)}>{u.unitNumber}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Owner Information */}
      <Card>
        <p className={sectionClass}>Owner Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required autoComplete="off" className={inputClass} placeholder="Enter first name" />
          </div>
          <div>
            <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required autoComplete="off" className={inputClass} placeholder="Enter last name" />
          </div>
        </div>
      </Card>

      {/* Primary Address */}
      <Card>
        <p className={sectionClass}>Primary Address</p>
        <div className="mb-4">
          <label className={labelClass}>Street Address <span className="text-red-500">*</span></label>
          <input name="primaryStreet" value={formData.primaryStreet} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter street address" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City <span className="text-red-500">*</span></label>
            <input name="primaryCity" value={formData.primaryCity} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter city" />
          </div>
          <div>
            <label className={labelClass}>State <span className="text-red-500">*</span></label>
            <input name="primaryState" value={formData.primaryState} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter state" />
          </div>
          <div>
            <label className={labelClass}>ZIP Code <span className="text-red-500">*</span></label>
            <input name="primaryZip" value={formData.primaryZip} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter ZIP code" />
          </div>
        </div>
      </Card>

      {/* Alternative Address */}
      <Card>
        <p className={sectionClass}>Alternative Address (Optional)</p>
        <div className="mb-4">
          <label className={labelClass}>Street Address</label>
          <input name="altStreet" value={formData.altStreet} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter street address" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input name="altCity" value={formData.altCity} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter city" />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input name="altState" value={formData.altState} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter state" />
          </div>
          <div>
            <label className={labelClass}>ZIP Code</label>
            <input name="altZip" value={formData.altZip} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter ZIP code" />
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card>
        <p className={sectionClass}>Contact Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="off" className={inputClass} placeholder="Enter email address" />
          </div>
          <div>
            <label className={labelClass}>Alternative Email Address</label>
            <input name="altEmail" type="email" value={formData.altEmail} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="Enter alternative email" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
            <input name="phone" value={formData.phone} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="(555) 123-4567" />
          </div>
          <div>
            <label className={labelClass}>Alternative Phone Number</label>
            <input name="altPhone" value={formData.altPhone} onChange={handleChange} autoComplete="off" className={inputClass} placeholder="(555) 123-4567" />
          </div>
        </div>
      </Card>

      {/* Board Member Status */}
      <Card>
        <p className={sectionClass}>Board Member Status</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isBoardMember" checked={!!formData.isBoardMember} onChange={handleChange} className="w-4 h-4 border-gray-400 rounded accent-gray-800" />
          <span className="text-sm text-gray-700">Owner is a Board Member</span>
        </label>
        {formData.isBoardMember && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelClass}>Term Start Date</label>
              <input type="date" name="termStartDate" value={formData.termStartDate?.slice(0, 10) || ""} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Term End Date</label>
              <input type="date" name="termEndDate" value={formData.termEndDate?.slice(0, 10) || ""} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="bg-gray-900 text-white px-5 py-2 rounded text-sm font-medium hover:bg-black disabled:opacity-50 transition">
          {loading ? "Saving…" : mode === "edit" ? "Save Changes" : "Add Owner"}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50 transition">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default OwnershipAccountForm;