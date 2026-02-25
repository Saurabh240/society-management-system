import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchCommunities, deleteCommunity } from "./communityApi";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function CommunityList() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const loadCommunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCommunities();
      setCommunities(data);
    } catch (err) {
      setError(err.message || "Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever navigating back to this page
  useEffect(() => {
    loadCommunities();
  }, [location.key]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this community?")) return;
    try {
      await deleteCommunity(id);
      await loadCommunities();
    } catch (err) {
      alert(err.message || "Failed to delete community");
    }
  };

  return (
    <div className="p-6">
      <Card className="w-full">

        <Card.Header className="flex justify-between items-center">
          <div>
            <Card.Title>Communities</Card.Title>
            <Card.Description>Manage all communities</Card.Description>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={loadCommunities} loading={loading}>
              Refresh
            </Button>
            <Button onClick={() => navigate("create")}>
              + Add Community
            </Button>
          </div>
        </Card.Header>

        <Card.Content>

          {loading && (
            <p className="text-gray-500 text-center py-6">Loading communities...</p>
          )}

          {error && (
            <p className="text-red-600 text-center py-6">{error}</p>
          )}

          {!loading && !error && communities.length === 0 && (
            <p className="text-gray-500 text-center py-6">No communities found.</p>
          )}

          {!loading && !error && communities.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="hidden md:table-header-group bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-center px-4 py-3">Status</th>
                    <th className="text-center px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="space-y-4 md:space-y-0">
                  {communities.map((community) => (
                    <tr
                      key={community.id}
                      className="block md:table-row border md:border-t rounded-lg md:rounded-none p-4 md:p-0 bg-white hover:bg-gray-50 transition"
                    >
                      <td className="block md:table-cell px-4 py-2 font-semibold text-lg md:text-base">
                        {community.name}
                      </td>

                      <td className="block md:table-cell px-4 py-2 md:text-center">
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
                      </td>

                      <td className="block md:table-cell px-4 py-3">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-2">

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`edit/${community.id}`, {
                                state: { community },
                              })
                            }
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleDelete(community.id)}
                          >
                            Delete
                          </Button>

                          <Button
  size="sm"
  variant="outline"
  onClick={() => navigate(`${community.id}`)}
>
  View
</Button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </Card.Content>
      </Card>
    </div>
  );
}