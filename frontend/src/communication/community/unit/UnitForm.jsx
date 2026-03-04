
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createUnit, updateUnit } from "./unitApi";
import { fetchCommunities } from "../communityApi";

import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import ErrorMessage from "../../../shared/components/ErrorMessage";

export default function UnitForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    unitNumber: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    occupancyStatus: "VACANT",
    communityId: "",
  });

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const data = await fetchCommunities();
        setCommunities(data);
      } catch (err) {
        setError("Failed to load communities");
      }
    };

    loadCommunities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      if (id) {
        await updateUnit(id, formData);
      } else {
        await createUnit(formData);
      }

      navigate("/dashboard/units", { replace: true });

    } catch (err) {
      setError(err?.message || "Failed to save unit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <Card>
        <Card.Header>
          <Card.Title>
            {id ? "Edit Unit" : "Create Unit"}
          </Card.Title>
          <Card.Description>
            {id
              ? "Update unit information"
              : "Add a new unit to the system"}
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-5">

            <Input
              label="Unit Number"
              value={formData.unitNumber}
              onChange={(e) =>
                setFormData({ ...formData, unitNumber: e.target.value })
              }
              required
            />

            <Input
              label="Street"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              required
            />

            <Input
              label="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
            />

            <Input
              label="State"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              required
            />

            <Input
              label="Zip Code"
              value={formData.zipCode}
              onChange={(e) =>
                setFormData({ ...formData, zipCode: e.target.value })
              }
              required
            />

            <Select
              label="Occupancy Status"
              name="occupancyStatus"
              value={formData.occupancyStatus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  occupancyStatus: e.target.value,
                })
              }
              required
              options={[
                { label: "VACANT", value: "VACANT" },
                { label: "OCCUPIED", value: "OCCUPIED" },
              ]}
            />

            <Select
              label="Community"
              name="communityId"
              value={formData.communityId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  communityId: e.target.value,
                })
              }
              required
              options={communities.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />

            <ErrorMessage message={error} />

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading}>
                {id ? "Update Unit" : "Save Unit"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/units")}
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