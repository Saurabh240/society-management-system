import { useEffect, useState } from "react";
import { fetchTenants } from "../tenant/tenantApi";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function TenantList() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-3xl">

        <Card.Header className="flex justify-between items-center">
          <Card.Title>Tenant List</Card.Title>

          <Button onClick={loadTenants} loading={loading}>
            Refresh
          </Button>
        </Card.Header>

        <Card.Content>

          {loading && (
            <p className="text-gray-500 text-center">
              Loading tenants...
            </p>
          )}

         
          {error && (
            <p className="text-red-600 text-center">
              {error}
            </p>
          )}

      
          {!loading && !error && tenants.length === 0 && (
            <p className="text-gray-500 text-center">
              No tenants found.
            </p>
          )}

  
          {!loading && !error && tenants.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse">

                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Subdomain</th>
                  </tr>
                </thead>

                <tbody>
                  {tenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-2 font-medium">
                        {tenant.name}
                      </td>
                      <td className="py-2 text-gray-600">
                        {tenant.subdomain}
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