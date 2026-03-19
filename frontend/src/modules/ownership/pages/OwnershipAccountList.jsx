

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { toast } from "react-toastify";
import { getAllOwners, getAllAssociations } from "../ownershipApi";
import OwnershipAccountTable from "../components/OwnershipAccountTable";
import Select from "@/components/ui/Select"; 

const PAGE_SIZE = 10; 

const OwnershipAccountList = () => {
  const navigate = useNavigate();

  const [allOwners, setAllOwners]         = useState([]);
  const [associations, setAssociations]   = useState([]);
  const [selectedAssoc, setSelectedAssoc] = useState("");  
  const [loading, setLoading]             = useState(true);
  const [currentPage, setCurrentPage]     = useState(1);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ownersRes, assocRes] = await Promise.all([
        getAllOwners(),
        getAllAssociations(),
      ]);
      setAllOwners(ownersRes.data?.data || []);
      setAssociations(assocRes.data?.data || []);
    } catch {
      toast.error("Failed to load ownership data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Filter logic
  const filtered = selectedAssoc
    ? allOwners.filter((o) => o.associationName === selectedAssoc)
    : allOwners;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDeleted = (ownerId) => {
    const updated = allOwners.filter((o) => o.ownerId !== ownerId);
    setAllOwners(updated);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Ownership Accounts
            </h1>
            
            <button
              onClick={() => navigate("/dashboard/associations/accounts/create")}
              className="flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90 shadow-sm"
              style={{ backgroundColor: "#1A2B6B" }}
            >
              <Plus size={18} /> Add Owner
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-80">
              <Select
                value={selectedAssoc}
                onChange={(e) => {
                  setSelectedAssoc(e.target.value);
                  setCurrentPage(1);
                }}
                options={[
                  { label: "All Associations", value: "" },
                  ...associations.map((a) => ({ label: a.name, value: a.name })),
                ]}
                fullWidth={true}
              />
            </div>
            
            {selectedAssoc && (
              <button
                onClick={() => { setSelectedAssoc(""); setCurrentPage(1); }}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium self-start md:self-center"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="animate-spin h-8 w-8 border-4 border-[#1A2B6B] border-t-transparent rounded-full" />
             <p className="text-sm font-medium text-gray-500">Loading accounts...</p>
          </div>
        ) : (
          <>
            <OwnershipAccountTable accounts={paginated} onDeleted={handleDeleted} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <p className="text-sm text-gray-500 font-medium">
                  Showing <span className="text-gray-900">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{" "}
                  <span className="text-gray-900">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of{" "}
                  <span className="text-gray-900">{filtered.length}</span> results
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-30 disabled:bg-gray-50 transition hover:bg-gray-50 text-gray-600"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border ${
                          currentPage === page
                            ? "bg-[#1A2B6B] text-white border-[#1A2B6B] shadow-md scale-105"
                            : "bg-white text-gray-600 border-gray-300 hover:border-[#1A2B6B] hover:text-[#1A2B6B]"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-30 disabled:bg-gray-50 transition hover:bg-gray-50 text-gray-600"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OwnershipAccountList;