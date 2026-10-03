export default function StatusBadge({ status, deliveryStatus, errorMessage }) {
  const effectiveStatus = (deliveryStatus || status || "UNKNOWN").toUpperCase();

  let style = "bg-gray-100 text-gray-700 border-gray-300";
  let label = effectiveStatus;

  if (["DELIVERED", "SENT"].includes(effectiveStatus)) {
    style = "bg-green-100 text-green-800 border-green-300";
    label = effectiveStatus === "DELIVERED" ? "Delivered" : "Sent";
  } else if (["FAILED", "DLQ", "ERROR"].includes(effectiveStatus)) {
    style = "bg-red-100 text-red-800 border-red-300";
    label = "Failed";
  } else if (["RETRYING", "PENDING", "QUEUED"].includes(effectiveStatus)) {
    style = "bg-yellow-100 text-yellow-800 border-yellow-300";
    label = effectiveStatus === "RETRYING" ? "Retrying" : "Queued";
  } else if (["SCHEDULED", "DRAFT"].includes(effectiveStatus)) {
    style = "bg-blue-100 text-blue-800 border-blue-300";
    label = effectiveStatus === "SCHEDULED" ? "Scheduled" : "Draft";
  }

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span className={`inline-block px-2.5 py-1 text-xs border rounded font-medium ${style}`}>
        {label}
      </span>
      {errorMessage && (
        <span className="text-[10px] text-red-600 max-w-xs truncate" title={errorMessage}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}