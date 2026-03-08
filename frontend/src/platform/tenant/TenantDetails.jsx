import { useLocation, useParams, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function TenantDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const tenant = state?.tenant;

  return (
    <div className="p-6 max-w-xl">
      <Card>
        <Card.Header>
          <Card.Title>Tenant Details</Card.Title>
          <Card.Description>
            View tenant information
          </Card.Description>
        </Card.Header>

        <Card.Content className="space-y-4">

          {!tenant ? (
            <p className="text-red-600">
              No tenant data found.
            </p>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">{tenant.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Subdomain</p>
                <p className="font-semibold">{tenant.subdomain}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    tenant.status === "INACTIVE"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {tenant.status}
                </span>
              </div>
            </>
          )}

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>

        </Card.Content>
      </Card>
    </div>
  );
}