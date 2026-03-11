import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { getAllAssociations, getAllUnits, getOwnersByUnit } from "../ownershipApi";
import OwnershipAccountTable from "../components/OwnershipAccountTable";

const PAGE_SIZE = 5;

const OwnershipAccountList = () => {
  const navigate = useNavigate();

  const [associations, setAssociations] = useState([]);
  const [allOwners, setAllOwners]       = useState([]);
  const [loading, setLoading]           = useState(true);

  const [selectedAssocId, setSelectedAssocId] = useState("");
  const [currentPage, setCurrentPage]         = useState(1);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [assocRes, unitsRes] = await Promise.all([
        getAllAssociations(),
        getAllUnits(),
      ]);

      const assocList = assocRes.data?.data || [];
      const unitList  = unitsRes.data?.data || [];

      setAssociations(assocList);

      const ownerResults = await Promise.allSettled(
        unitList.map((u) =>
          getOwnersByUnit(u.id).then((res) => {
            const owners = res.data?.data || [];
            return owners.map((o) => ({
              ...o,
              unitId:          u.id,
              unitNumber:      u.unitNumber,
              associationId:   u.associationId,
              associationName: u.associationName,
            }));
          })
        )
      );

      const merged = ownerResults
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value);

      setAllOwners(merged);
    } catch {
      toast.error("Failed to load ownership data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Reset page when association filter changes
  useEffect(() => { setCurrentPage(1); }, [selectedAssocId]);

  // Client-side filter — association only
  const filtered = allOwners.filter((o) =>
    !selectedAssocId || String(o.associationId) === String(selectedAssocId)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDeleted = (id) => {
    const updated = allOwners.filter((o) => o.id !== id);
    setAllOwners(updated);
    const newTotal = Math.ceil(
      updated.filter((o) => !selectedAssocId || String(o.associationId) === String(selectedAssocId)).length / PAGE_SIZE
    );
    if (currentPage > newTotal && newTotal > 0) setCurrentPage(newTotal);
  };

  const selectClass =
    "border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Ownership Accounts</h1>
        <button
          onClick={() => navigate("/dashboard/associations/accounts/create")}
          className="self-start sm:self-auto bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          + Add Owner
        </button>
      </div>

      {/* Filter — association only */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm text-gray-600 font-medium">Filter by Association:</span>
        <select
          value={selectedAssocId}
          onChange={(e) => setSelectedAssocId(e.target.value)}
          className={selectClass}
        >
          <option value="">All Associations</option>
          {associations.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {selectedAssocId && (
          <button
            onClick={() => setSelectedAssocId("")}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400 text-sm">Loading owners…</div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          {allOwners.length === 0
            ? "No ownership accounts found."
            : "No owners match the selected filter."}
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <OwnershipAccountTable accounts={paginated} onDeleted={handleDeleted} />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} owners
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition border ${
                      currentPage === page
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnershipAccountList;