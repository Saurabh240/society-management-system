
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUnit } from "./unitApi";

import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function UnitForm() {
  const navigate = useNavigate();

  const [unitNumber, setUnitNumber] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [occupancyStatus, setOccupancyStatus] = useState("VACANT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await createUnit({
        unitNumber,
        propertyId: Number(propertyId),
        occupancyStatus,
      });

      // Go back to unit list
      navigate("..", { replace: true });

    } catch (err) {
      setError(err?.message || "Failed to create unit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <Card>
        <Card.Header>
          <Card.Title>Create Unit</Card.Title>
          <Card.Description>
            Add a new unit to your property
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-5">

            <Input
              label="Unit Number"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              required
            />

            <Input
              label="Property ID"
              type="number"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              required
            />

            <div>
              <label className="block mb-2 text-sm font-medium">
                Occupancy Status
              </label>

              <select
                value={occupancyStatus}
                onChange={(e) =>
                  setOccupancyStatus(e.target.value)
                }
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="VACANT">VACANT</option>
                <option value="OCCUPIED">OCCUPIED</option>
              </select>
            </div>

            {error && (
              <p className="text-red-600 text-sm">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("..")}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={loading}
              >
                Save Unit
              </Button>
            </div>

          </form>
        </Card.Content>
      </Card>
    </div>
  );
}