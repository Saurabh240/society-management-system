import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { getAllOwners } from "../ownershipApi";
import OwnershipAccountTable from "../components/OwnershipAccountTable";

const PAGE_SIZE = 5;

const OwnershipAccountList = () => {
  const navigate = useNavigate();

  const [allOwners, setAllOwners]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllOwners();
      setAllOwners(res.data?.data || []);
    } catch {
      toast.error("Failed to load ownership data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalPages = Math.ceil(allOwners.length / PAGE_SIZE);
  const paginated  = allOwners.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDeleted = (ownerId) => {
    const updated  = allOwners.filter((o) => o.ownerId !== ownerId);
    setAllOwners(updated);
    const newTotal = Math.ceil(updated.length / PAGE_SIZE);
    if (currentPage > newTotal && newTotal > 0) setCurrentPage(newTotal);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-semibold" style={{ color: "#1A2B6B" }}>
          Ownership Accounts
        </h1>
        <button
          onClick={() => navigate("/dashboard/associations/accounts/create")}
          className="self-start sm:self-auto inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
          style={{ backgroundColor: "#1A2B6B" }}
        >
          <Plus size={16} /> Add Owner
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-sm" style={{ color: "#1A2B6B" }}>Loading owners…</div>
      )}

      {/* Table — always renders when not loading */}
      {!loading && (
        <>
          <OwnershipAccountTable accounts={paginated} onDeleted={handleDeleted} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, allOwners.length)} of {allOwners.length} owners
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition hover:opacity-80"
                  style={{ borderColor: "#1A2B6B", color: "#1A2B6B" }}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition border"
                    style={
                      currentPage === page
                        ? { backgroundColor: "#1A2B6B", color: "#fff", borderColor: "#1A2B6B" }
                        : { backgroundColor: "#fff", color: "#1A2B6B", borderColor: "#1A2B6B" }
                    }
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition hover:opacity-80"
                  style={{ borderColor: "#1A2B6B", color: "#1A2B6B" }}
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