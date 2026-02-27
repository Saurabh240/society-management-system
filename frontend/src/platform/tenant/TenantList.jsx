

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTenants } from "../tenant/tenantApi";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function TenantList() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const loadTenants = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      setError(err.message || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  return (
    <div className="p-6">
      <Card className="w-full">


        <Card.Header className="flex justify-between items-center">
          <div>
            <Card.Title>Tenants</Card.Title>
            <Card.Description>
              Manage all registered tenants
            </Card.Description>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={loadTenants}
              loading={loading}
            >
              Refresh
            </Button>

        
            <Button onClick={() => navigate("create")}>
              + Add Tenant
            </Button>
          </div>
        </Card.Header>

        <Card.Content>

        
          {loading && (
            <p className="text-gray-500 text-center py-6">
              Loading tenants...
            </p>
          )}

        
          {error && (
            <p className="text-red-600 text-center py-6">
              {error}
            </p>
          )}

      
          {!loading && !error && tenants.length === 0 && (
            <p className="text-gray-500 text-center py-6">
              No tenants found.
            </p>
          )}


          {!loading && !error && tenants.length > 0 && (
            <div className="mt-4 overflow-x-auto">

              <table className="w-full text-sm">

          
                <thead className="hidden md:table-header-group bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Subdomain</th>
                    <th className="text-center px-4 py-3">Status</th>
                    <th className="text-center px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="space-y-4 md:space-y-0">
                  {tenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="block md:table-row border md:border-t rounded-lg md:rounded-none p-4 md:p-0 bg-white hover:bg-gray-50 transition"
                    >
                      <td className="block md:table-cell px-4 py-2 font-semibold text-lg md:text-base">
                        {tenant.name}
                      </td>

                      <td className="block md:table-cell px-4 py-2 text-gray-600">
                        {tenant.subdomain}
                      </td>

                      <td className="block md:table-cell px-4 py-2 md:text-center">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            tenant.status === "INACTIVE"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {tenant.status || "ACTIVE"}
                        </span>
                      </td>

                      <td className="block md:table-cell px-4 py-3">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>

                          <Button
  size="sm"
  className="whitespace-nowrap"
  onClick={() =>
    navigate(`subscription/${tenant.id}`, {
      state: { tenant },
    })
  }
>
  Edit Subscription
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

