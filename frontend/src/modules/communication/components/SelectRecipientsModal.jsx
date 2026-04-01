import { useState } from "react";
import { X, ChevronRight, ChevronDown } from "lucide-react";
import ReactDOM from "react-dom";
import { ASSOCIATIONS } from "../data";

const VENDORS = [
  { id: "v1", name: "Green Thumb Landscaping", contact: "John Smith",    email: "john@greenthumb.com"    },
  { id: "v2", name: "ABC Plumbing Services",   contact: "Sarah Johnson", email: "sarah@abcplumbing.com"  },
];

export default function SelectRecipientsModal({ onClose, onAdd }) {
  const [selectedAssocId, setSelectedAssocId] = useState(null);
  const [checkedAssocs, setCheckedAssocs]     = useState({});
  const [checkedOwners, setCheckedOwners]     = useState({});
  const [checkedVendors, setCheckedVendors]   = useState({});

  const activeAssoc = ASSOCIATIONS.find((a) => a.id === selectedAssocId);

  const toggleAssociation = (assocId, e) => {
    e.stopPropagation();
    const assoc   = ASSOCIATIONS.find((a) => a.id === assocId);
    const checked = !checkedAssocs[assocId];
    setCheckedAssocs((prev) => ({ ...prev, [assocId]: checked }));
    const ownerUpdates = {};
    assoc.owners.forEach((o) => { ownerUpdates[o.id] = checked; });
    setCheckedOwners((prev) => ({ ...prev, ...ownerUpdates }));
  };

  const toggleOwner  = (id) => setCheckedOwners((prev)  => ({ ...prev, [id]: !prev[id]  }));
  const toggleVendor = (id) => setCheckedVendors((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalSelected =
    Object.values(checkedOwners).filter(Boolean).length +
    Object.values(checkedVendors).filter(Boolean).length;

  const handleAdd = () => {
    const owners  = ASSOCIATIONS.flatMap((a) => a.owners.filter((o) => checkedOwners[o.id]));
    const vendors = VENDORS.filter((v) => checkedVendors[v.id]).map((v) => ({ id: v.id, name: v.name }));
    onAdd([...owners, ...vendors]);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-10001 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col" style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Select Recipients</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Three-column body */}
        <div className="flex flex-1 overflow-hidden border-b border-gray-200">

          {/* Associations */}
          <div className={`sm:w-1/3 border-r border-gray-200 overflow-y-auto ${selectedAssocId ? "hidden sm:block" : "block"}`}>
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Associations</span>
            </div>
            {ASSOCIATIONS.map((assoc) => (
              <div
                key={assoc.id}
                onClick={() => setSelectedAssocId(assoc.id)}
                className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${selectedAssocId === assoc.id ? "bg-gray-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={!!checkedAssocs[assoc.id]} onChange={(e) => toggleAssociation(assoc.id, e)} className="w-4 h-4 cursor-pointer" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{assoc.name}</p>
                    <p className="text-xs text-gray-500">{assoc.ownerCount} owners</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 hidden sm:block" />
                <ChevronDown  size={16} className="text-gray-400 block sm:hidden" />
              </div>
            ))}
          </div>

          {/* Owners */}
          <div className={`sm:w-1/3 border-r border-gray-200 overflow-y-auto ${selectedAssocId ? "block" : "hidden sm:block"}`}>
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              {selectedAssocId && (
                <button onClick={() => setSelectedAssocId(null)} className="sm:hidden text-xs text-gray-500 underline mr-2">← Back</button>
              )}
              <span className="text-sm font-semibold text-gray-700">Owners</span>
            </div>
            {!activeAssoc ? (
              <div className="flex items-center justify-center h-32 text-sm text-gray-400 text-center px-4">
                Select an association to view owners
              </div>
            ) : (
              activeAssoc.owners.map((owner) => (
                <div key={owner.id} onClick={() => toggleOwner(owner.id)}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                  <input type="checkbox" checked={!!checkedOwners[owner.id]} onChange={() => toggleOwner(owner.id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 cursor-pointer" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.name}</p>
                    <p className="text-xs text-gray-500">{owner.unit}</p>
                    <p className="text-xs text-gray-500">{owner.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Vendors */}
          <div className="sm:w-1/3 overflow-y-auto">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Vendors</span>
            </div>
            {VENDORS.map((vendor) => (
              <div key={vendor.id} onClick={() => toggleVendor(vendor.id)}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                <input type="checkbox" checked={!!checkedVendors[vendor.id]} onChange={() => toggleVendor(vendor.id)} onClick={(e) => e.stopPropagation()} className="w-4 h-4 cursor-pointer" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                  <p className="text-xs text-gray-500">{vendor.contact}</p>
                  <p className="text-xs text-gray-500">{vendor.email}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4">
          <span className="text-sm text-gray-500">
            {totalSelected === 0 ? "No recipients selected" : `${totalSelected} recipient${totalSelected > 1 ? "s" : ""} selected`}
          </span>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleAdd} className="flex-1 sm:flex-none px-4 py-2 text-sm text-white rounded transition hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>Add Recipients</button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}