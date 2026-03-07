import Card from "@/components/ui/Card";

export default function AssociationOverview({ association }) {
  return (
    <Card className="border-none shadow-none bg-white p-6">
      <h2 className="text-lg font-bold mb-6">Association Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
        <div className="space-y-6">
          <DetailItem label="Association Name" value={association.name} />
          <DetailItem label="Street Address" value={association.address} />
          <DetailItem label="State" value={association.state} />
          <DetailItem label="Tax Identity Type" value={association.taxType} />
          <DetailItem label="Total Units" value={association.totalUnits} />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <span className="bg-gray-100 px-3 py-1 text-xs font-medium border border-gray-200 rounded text-gray-700">
              {association.status}
            </span>
          </div>

          <DetailItem label="City" value={association.city} />
          <DetailItem label="ZIP Code" value={association.zip} />
          <DetailItem label="Tax Payer ID" value={association.taxPayerId} />
        </div>
      </div>
    </Card>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900">{value}</p>
    </div>
  );
}