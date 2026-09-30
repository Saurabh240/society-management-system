import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBillById, getBillAttachments, downloadBillAttachment } from "../api/accountingApi";
import dayjs from "dayjs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft, FileText, Download, Pencil } from "lucide-react";
import { toast } from "react-toastify";

export default function ViewBillPage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const [billRes, attachRes] = await Promise.all([
          getBillById(id),
          getBillAttachments(id).catch(() => ({ data: [] }))
        ]);
        setBill(billRes.data?.data || billRes.data);

        const attachList = attachRes.data?.data || attachRes.data?.content || (Array.isArray(attachRes.data) ? attachRes.data : []);
        setAttachments(attachList);
      } catch {
        console.error("Failed to fetch bill");
      }
    };
    fetchBill();
  }, [id]);

  const handleDownloadAttachment = async (att) => {
    const fileName = att.originalFilename || att.fileName || att.originalName || att.name || "attachment";
    const targetBillId = id || bill?.id || att.billId;

    try {
      setDownloadingId(att.id || fileName);

      // 1. Fetch via Spring Boot Attachment Download Endpoint: GET /api/v1/accounting/bills/{billId}/attachments/{attachmentId}/download
      if (att.id && targetBillId) {
        const res = await downloadBillAttachment(targetBillId, att.id);
        const contentType = att.contentType || res.headers["content-type"] || "application/octet-stream";
        const blob = new Blob([res.data], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.success(`Downloaded ${fileName}`);
        return;
      }

      // 2. Direct blob / data URL fallback
      const rawUrl = att.fileUrl || att.url || att.downloadUrl || att.fileDownloadUri || att.filePath || att.path;
      if (rawUrl && (rawUrl.startsWith("blob:") || rawUrl.startsWith("data:"))) {
        const link = document.createElement("a");
        link.href = rawUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // 3. Base64 content fallback if provided inline
      if (att.content || att.fileContent || att.base64Data) {
        const dataStr = att.content || att.fileContent || att.base64Data;
        const mime = att.contentType || att.mimeType || "application/octet-stream";
        const dataUrl = dataStr.startsWith("data:") ? dataStr : `data:${mime};base64,${dataStr}`;
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      toast.info(`Attachment "${fileName}" is attached to this bill.`);
    } catch (err) {
      console.error("Failed to download attachment:", err);
      toast.error(err.response?.data?.message || `Unable to download ${fileName}`);
    } finally {
      setDownloadingId(null);
    }
  };

  if (!bill) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div 
        className="flex items-center gap-2 text-sm text-blue-900 cursor-pointer mb-4 hover:underline font-semibold"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        <span>Back to Bills</span>
      </div>
      <Card className="p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold">Bill Details</h2>
          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/accounting/bills/edit/${bill.id || id}`)}>
            <Pencil size={14} className="mr-1" /> Edit Bill
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><strong>Bill #:</strong> {bill.billNumber}</p>
          <p><strong>Status:</strong> {bill.status}</p>
          <p><strong>Issue Date:</strong> {dayjs(bill.issueDate).format("YYYY-MM-DD")}</p>
          <p><strong>Due Date:</strong> {dayjs(bill.dueDate).format("YYYY-MM-DD")}</p>
          <p><strong>Total Amount:</strong> ${(Number(bill.totalAmount) || 0).toFixed(2)}</p>
          <p><strong>Memo:</strong> {bill.memo || "—"}</p>
        </div>

        {/* Line Items */}
        <div>
          <h3 className="font-semibold text-base mb-2">Line Items</h3>
          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-700">
              <tr>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Expense Account</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {bill.lineItems?.map((item, i) => (
                <tr key={i}>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3">{item.expenseAccountName || item.expenseAccountId}</td>
                  <td className="p-3 text-right font-semibold">${(Number(item.amount) || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attachments */}
        <div>
          <h3 className="font-semibold text-base mb-2">Attachments ({attachments.length})</h3>
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No attachments for this bill.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attachments.map((att, i) => (
                <button
                  type="button"
                  key={att.id || i}
                  disabled={downloadingId === att.id}
                  onClick={() => handleDownloadAttachment(att)}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-blue-50/50 hover:border-blue-300 transition-colors bg-white shadow-sm w-full text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={20} className="text-blue-700 shrink-0" />
                    <span className="text-sm font-medium text-slate-800 group-hover:text-blue-900 truncate">
                      {att.originalFilename || att.fileName || att.originalName || att.name || `Attachment ${i + 1}`}
                    </span>
                  </div>
                  <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded shrink-0 flex items-center gap-1 group-hover:bg-blue-100">
                    <Download size={14} />
                    {downloadingId === att.id ? "Downloading..." : "Download / View"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}