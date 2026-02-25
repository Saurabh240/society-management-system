import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCommunityById } from "./communityApi";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCommunityById(id);
        setCommunity(data);
      } catch (err) {
        setError(err.message || "Failed to load community");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Community Detail</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      {loading && (
        <p className="text-gray-500 text-center py-6">Loading...</p>
      )}

      {error && (
        <p className="text-red-600 text-center py-6">{error}</p>
      )}

      {!loading && !error && community && (
        <Card className="w-full">
          <Card.Content className="pt-5 space-y-0">

            <h3 className="text-base font-bold mb-4">Community Information</h3>

            <div className="flex justify-between items-center py-3 border-b text-sm">
              <span className="text-gray-500">Name</span>
              <span className="font-semibold">{community.name}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b text-sm">
              <span className="text-gray-500">Status</span>
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  community.status === "INACTIVE"
                    ? "bg-red-100 text-red-700"
                    : community.status === "SUSPENDED"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {community.status || "ACTIVE"}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b text-sm">
              <span className="text-gray-500">Tenant ID</span>
              <span className="text-gray-700">{community.tenantId}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b text-sm">
              <span className="text-gray-500">Created At</span>
              <span className="text-gray-700">
                {new Date(community.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 text-sm">
              <span className="text-gray-500">Updated At</span>
              <span className="text-gray-700">
                {new Date(community.updatedAt).toLocaleString()}
              </span>
            </div>

          </Card.Content>
        </Card>
      )}

      {/* Actions */}
      {!loading && !error && community && (
        <div className="flex gap-3">
          <Button
            onClick={() =>
              navigate(`/dashboard/settings/communities/edit/${community.id}`, {
                state: { community },
              })
            }
          >
            Edit Community
          </Button>
        </div>
      )}

    </div>
  );
}