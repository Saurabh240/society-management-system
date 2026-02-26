
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUnit } from "./unitApi";

import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Select from "../../../components/Select";
import ErrorMessage from "../../../shared/components/ErrorMessage";

export default function UnitForm() {
  const navigate = useNavigate();

  const [unitNumber, setUnitNumber] = useState("");
  const [communityId, setCommunityId] = useState("");
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
        communityId: Number(communityId),
        occupancyStatus,
      });

   
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
              label="Community ID"
              type="number"
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              required
            />

           
                  <Select
              label="Status"
              name="status"
              value={occupancyStatus}
              onChange={(e) =>
                setOccupancyStatus(e.target.value)
              }
              required
              options={[
                { label: "Vacant", value: "VACANT" },
                { label: "Occupied", value: "OCCUPIED" },
              ]}
            />
              
          
            <ErrorMessage message={error} />

            <div className="flex gap-3 pt-4">

              <Button
                type="submit"
                loading={loading}
              >
                Save Unit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("..")}
                disabled={loading}
              >
                Cancel
              </Button>

              
            </div>

          </form>
        </Card.Content>
      </Card>
    </div>
  );
}