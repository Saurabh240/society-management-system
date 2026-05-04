import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBillById } from "../api/accountingApi";
import dayjs from "dayjs";
import Card from "@/components/ui/Card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";



export default function ViewBillPage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
   const navigate = useNavigate();
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await getBillById(id);
        setBill(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to fetch bill");
      }
    };
    fetchBill();
  }, [id]);

  if (!bill) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
        <div 
  className="flex items-center gap-2 text-sm text-blue-900 cursor-pointer mb-4"
  onClick={() => navigate(-1)}
>
  <ArrowLeft size={16} />
  <span>Back to Bills</span>
</div>
      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Bill Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <p><strong>Bill #:</strong> {bill.billNumber}</p>
          <p><strong>Status:</strong> {bill.status}</p>
          <p><strong>Issue Date:</strong> {dayjs(bill.issueDate).format("YYYY-MM-DD")}</p>
          <p><strong>Due Date:</strong> {dayjs(bill.dueDate).format("YYYY-MM-DD")}</p>
          <p><strong>Total Amount:</strong> {bill.totalAmount}</p>
          <p><strong>Memo:</strong> {bill.memo || "—"}</p>
        </div>

        {/* Line Items */}
        <div>
          <h3 className="font-semibold mt-4 mb-2">Line Items</h3>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Expense Account</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.lineItems?.map((item, i) => (
                <tr key={i}>
                  <td className="p-2">{item.description}</td>
                  <td className="p-2">{item.expenseAccountName || item.expenseAccountId}</td>
                  <td className="p-2 text-right">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}