import { useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function UnitDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const unit = state?.unit;

  if (!unit) {
    return (
      <div className="p-6">
        <Card>
          <Card.Content>
            <p className="text-red-600">Unit not found.</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <Card>

        <Card.Header>
          <Card.Title>Unit Details</Card.Title>
          <Card.Description>
            View unit information
          </Card.Description>
        </Card.Header>

        <Card.Content>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Unit Number</th>
                  <th className="text-left px-4 py-3">Street</th>
                  <th className="text-left px-4 py-3">City</th>
                  <th className="text-left px-4 py-3">State</th>
                  <th className="text-left px-4 py-3">Zip</th>
                  <th className="text-center px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t bg-white">
                  <td className="px-4 py-3 font-semibold">
                    {unit.unitNumber}
                  </td>

                  <td className="px-4 py-3">{unit.street}</td>
                  <td className="px-4 py-3">{unit.city}</td>
                  <td className="px-4 py-3">{unit.state}</td>
                  <td className="px-4 py-3">{unit.zipCode}</td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        unit.occupancyStatus === "OCCUPIED"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {unit.occupancyStatus}
                    </span>
                  </td>
                </tr>
              </tbody>

            </table>
          </div>

          <div className="flex gap-3 mt-6">
          

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