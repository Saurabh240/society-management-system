import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { getAllAssociations, getAllUnits } from "../ownershipApi";

const emptyForm = {
  firstName: "", lastName: "", email: "", altEmail: "",
  phone: "", altPhone: "",
  primaryStreet: "", primaryCity: "", primaryState: "", primaryZip: "",
  altStreet: "", altCity: "", altState: "", altZip: "",
  isBoardMember: false, termStartDate: "", termEndDate: "",
  designation: "",
  associationId: "", unitId: "",
};

const OwnershipAccountForm = ({ initialData = {}, onSubmit, loading, mode = "create" }) => {
  const navigate = useNavigate();
  const seededRef = useRef(false);

  const [associations, setAssociations] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [units, setUnits] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    getAllAssociations().then((res) => setAssociations(res.data?.data || [])).catch(console.error);
    getAllUnits().then((res) => setAllUnits(res.data?.data || [])).catch(console.error);
  }, []);

  // seeding for edit mode
  useEffect(() => {
    if (seededRef.current) return;
    if (!initialData || Object.keys(initialData).length === 0) return;
    if (associations.length === 0) return;

    let associationId = String(initialData.associationId || "");
    let unitId = String(initialData.unitId || "");

    if (!associationId && initialData.associationName) {
      const matched = associations.find((a) => a.name === initialData.associationName);
      associationId = String(matched?.id || "");
    }

    if (!unitId && initialData.unitNumber && associationId) {
      if (allUnits.length === 0) return;
      const matched = allUnits.find(
        (u) => String(u.unitNumber) === String(initialData.unitNumber) &&
          String(u.associationId) === associationId
      );
      unitId = String(matched?.id || "");
    }

    setFormData({
      ...emptyForm,
      ...initialData,
      associationId,
      unitId,
      isBoardMember: Boolean(initialData.isBoardMember),
      termStartDate: initialData.termStartDate?.slice(0, 10) || "",
      termEndDate: initialData.termEndDate?.slice(0, 10) || "",
      designation: initialData.designation || "",
    });
    seededRef.current = true;
  }, [initialData, associations, allUnits]);

  // filter units by selected association
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
      // clear board member fields when unchecked
      ...(name === "isBoardMember" && !checked ? {
        termStartDate: "",
        termEndDate: "",
        designation: "",
      } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      unitId: Number(formData.unitId),
      ...(formData.isBoardMember ? {
        termStartDate: formData.termStartDate ? `${formData.termStartDate}T00:00:00Z` : null,
        termEndDate: formData.termEndDate ? `${formData.termEndDate}T00:00:00Z` : null,
      } : {
        termStartDate: null,
        termEndDate: null,
        designation: "",
      }),
    };
    onSubmit(payload);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-900 hover:text-blue-800 mb-4 transition-colors font-medium text-sm group"
      >
        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Ownership Accounts</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">
        {mode === "edit" ? "Edit Owner" : "Add Owner"}
      </h1>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <Card.Content className="p-8 space-y-10">

            {/* Association + Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Association"
                name="associationId"
                value={formData.associationId}
                onChange={handleChange}
                required
                options={[
                  { label: "Select Association", value: "", disabled: true },
                  ...associations.map((a) => ({ label: a.name, value: String(a.id) }))
                ]}
              />
              <Select
                label="Unit"
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                required
                disabled={!formData.associationId}
                options={[
                  { label: "Select Unit", value: "", disabled: true },
                  ...units.map((u) => ({ label: `Unit ${u.unitNumber}`, value: String(u.id) }))
                ]}
              />
            </div>

            {/* Owner Information */}
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Owner Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </section>

            {/* Primary Address */}
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Primary Address</h4>
              <Input label="Street Address" name="primaryStreet" value={formData.primaryStreet} onChange={handleChange} required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="City" name="primaryCity" value={formData.primaryCity} onChange={handleChange} required />
                <Input label="State" name="primaryState" value={formData.primaryState} onChange={handleChange} required />
                <Input label="ZIP Code" name="primaryZip" value={formData.primaryZip} onChange={handleChange} required />
              </div>
            </section>

            {/* Alternative Address */}
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Alternative Address (Optional)</h4>
              <Input label="Street Address" name="altStreet" value={formData.altStreet} onChange={handleChange} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="City" name="altCity" value={formData.altCity} onChange={handleChange} />
                <Input label="State" name="altState" value={formData.altState} onChange={handleChange} />
                <Input label="ZIP Code" name="altZip" value={formData.altZip} onChange={handleChange} />
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-6">
              <h4 className="text-lg font-semibold">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                <Input label="Alternative Email" type="email" name="altEmail" value={formData.altEmail} onChange={handleChange} />
                <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
                <Input label="Alternative Phone" name="altPhone" value={formData.altPhone} onChange={handleChange} />
              </div>
            </section>

            {/* Board Member Status */}
            <section className="space-y-6 pt-4">
              <h4 className="text-lg font-semibold border-b border-gray-100 pb-2 text-gray-900">Board Member Status</h4>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isBoardMember"
                    checked={!!formData.isBoardMember}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Owner is a Board Member</span>
                </label>
              </div>

              {formData.isBoardMember && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                  <Input label="Term Start Date" type="date" name="termStartDate" value={formData.termStartDate?.slice(0, 10) || ""} onChange={handleChange} required />
                  <Input label="Term End Date" type="date" name="termEndDate" value={formData.termEndDate?.slice(0, 10) || ""} onChange={handleChange} required />
                  <Select
                    label="Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    options={[
                      { label: "Select Designation", value: "", disabled: true },
                       { label: "Chairman", value: "Chairman" },
                      { label: "President", value: "President" },
                      { label: "Vice President", value: "Vice President" },
                      { label: "Secretary", value: "Secretary" },
                      { label: "Director", value: "Director" },
                    ]}
                  />
                </div>
              )}
            </section>

          </Card.Content>

          <Card.Footer className="px-8 py-6 flex gap-4 border-none">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : mode === "edit" ? "Save Changes" : "Add Owner"}
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Card.Footer>
        </Card>
      </form>
    </div>
  );
};

export default OwnershipAccountForm;