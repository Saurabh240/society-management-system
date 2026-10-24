import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "react-toastify";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/shared/components/PageHeader";
import Pagination from "@/shared/components/Pagination";
import StatusBadge from "@/shared/components/StatusBadge";
import ConfirmDialog from "@/shared/components/ConfirmDialog";
import usePagination from "@/shared/hooks/usePagination";
import { TABLE_WRAP, THEAD_STYLE, TH, TD, TBODY, ROW, EMPTY_CELL } from "@/shared/styles/tableStyles";
import { getVendors, deleteVendor, batchDeleteVendors } from "@/modules/maintenance/api/maintenanceApi";

export default function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id | "multiple"

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await getVendors();
      setVendors(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vendors;
    return vendors.filter((v) =>
      [v.companyName, v.firstName, v.lastName, v.serviceCategory, v.email, v.mobilePhone, v.workPhone]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(term))
    );
  }, [vendors, search]);

  const pg = usePagination(filtered, 10, search);
  const pageIds = pg.pageItems.map((v) => v.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleAllOnPage = () =>
    setSelectedIds((prev) =>
      allOnPageSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]
    );
  const toggleRow = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const handleDeleteExecute = async () => {
    setDeleting(true);
    try {
      if (confirmDeleteId === "multiple") {
        await batchDeleteVendors(selectedIds);
        toast.success(`${selectedIds.length} vendors deleted`);
      } else {
        await deleteVendor(confirmDeleteId);
        toast.success("Vendor deleted");
      }
      setSelectedIds([]);
      fetchVendors();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const displayName = (v) => v.companyName || [v.firstName, v.lastName].filter(Boolean).join(" ") || "—";

  return (
    <div className="p-6">
      <PageHeader
        title="Maintenance"
        subtitle="Vendors and service providers"
        actions={
          <>
            {selectedIds.length > 0 && (
              <Button variant="danger" size="sm" onClick={() => setConfirmDeleteId("multiple")}>
                Delete Selected ({selectedIds.length})
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => navigate("add")}>
              <Plus size={16} className="mr-1" /> Add Vendor
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by name, category, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={TABLE_WRAP}>
        <table className="w-full table-auto border-collapse min-w-[760px]">
          <thead style={THEAD_STYLE}>
            <tr>
              <th className={`${TH} w-10`}>
                <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={allOnPageSelected} onChange={toggleAllOnPage} />
              </th>
              <th className={TH}>Vendor Name</th>
              <th className={TH}>Category</th>
              <th className={TH}>Contact</th>
              <th className={TH}>Status</th>
              <th className={`${TH} text-center`}>Action</th>
            </tr>
          </thead>
          <tbody className={TBODY}>
            {loading ? (
              <tr><td colSpan={6} className={EMPTY_CELL}>Loading vendors...</td></tr>
            ) : pg.pageItems.length === 0 ? (
              <tr><td colSpan={6} className={EMPTY_CELL}>{search ? "No vendors match your search." : "No vendors found."}</td></tr>
            ) : (
              pg.pageItems.map((v) => (
                <tr key={v.id} className={`${ROW} ${selectedIds.includes(v.id) ? "bg-blue-50" : ""}`}>
                  <td className={`${TD} text-center`}>
                    <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={selectedIds.includes(v.id)} onChange={() => toggleRow(v.id)} />
                  </td>
                  <td className={TD}>
                    <button
                      onClick={() => navigate(`/dashboard/maintenance/view/${v.id}`)}
                      className="font-semibold text-gray-900 hover:text-blue-700 hover:underline text-left"
                    >
                      {displayName(v)}
                    </button>
                    {v.companyName && (v.firstName || v.lastName) && (
                      <div className="text-xs text-gray-400">{v.firstName} {v.lastName}</div>
                    )}
                  </td>
                  <td className={TD}>{v.serviceCategory || "—"}</td>
                  <td className={TD}>
                    <div>{v.email || "—"}</div>
                    <div className="text-xs text-gray-400">{v.mobilePhone || v.workPhone || "No phone"}</div>
                  </td>
                  <td className={TD}><StatusBadge status={v.status || "ACTIVE"} /></td>
                  <td className={TD}>
                    <div className="flex justify-center gap-3">
                      <button title="View" onClick={() => navigate(`/dashboard/maintenance/view/${v.id}`)} className="text-gray-400 hover:text-blue-900"><Eye size={18} /></button>
                      <button title="Edit" onClick={() => navigate(`/dashboard/maintenance/edit/${v.id}`)} className="text-gray-400 hover:text-blue-900"><Pencil size={18} /></button>
                      <button title="Delete" onClick={() => setConfirmDeleteId(v.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && <Pagination {...pg.paginationProps} />}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Confirm Delete"
          message={
            confirmDeleteId === "multiple"
              ? `Delete ${selectedIds.length} selected vendors? This cannot be undone.`
              : "Delete this vendor? This cannot be undone."
          }
          loading={deleting}
          onClose={() => setConfirmDeleteId(null)}
          onConfirm={handleDeleteExecute}
        />
      )}
    </div>
  );
}
