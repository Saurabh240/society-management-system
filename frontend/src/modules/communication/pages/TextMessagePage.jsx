import CreateTextMessageModal from "../components/CreateTextMessageModal";
import { TEXT_MESSAGES }      from "../data";
import Button from "@/components/ui/Button";
import { useState } from "react";
import StatusBadge        from "../components/StatusBadge";

const COLUMNS = ["Message", "Recipient", "Phone Number", "Date", "Status", ""];

export default function TextMessagePage() {
  const [messages, setMessages]         = useState(TEXT_MESSAGES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewItem, setViewItem]     = useState(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>+ Create Text Message</Button>
      </div>

      <div className="w-full border border-gray-300 rounded-xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead style={{ backgroundColor: "#a9c3f7" }}>
            <tr>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tl-xl">Message</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Recipient</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Phone Number</th>
              <th className="border-r border-gray-300 p-4 text-xs font-bold uppercase text-gray-800 text-center">Date</th>
              <th className="p-4 text-xs font-bold uppercase text-gray-800 text-center rounded-tr-xl">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {messages.length === 0 ? (
              <tr><td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-sm text-gray-400">No text messages found.</td></tr>
            ) : (
              messages.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`border-r border-gray-200 p-4 text-sm font-semibold underline cursor-pointer text-center max-w-xs ${idx === messages.length - 1 ? "rounded-bl-xl" : ""}`} style={{ color: "var(--color-primary)" }} onClick={() => setViewItem(item)}>{item.message}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center whitespace-nowrap">{item.recipient}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center">{item.phone}</td>
                  <td className="border-r border-gray-200 p-4 text-sm text-gray-700 text-center whitespace-nowrap">{item.date}</td>
                  <td className={`p-4 text-center ${idx === messages.length - 1 ? "rounded-br-xl" : ""}`}><StatusBadge status={item.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {viewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/40" onClick={() => setViewItem(null)}>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">View Text Message</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-4"><span className="text-gray-500 w-24">Recipient:</span><span className="text-gray-700">{viewItem.recipient}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-24">Phone:</span><span className="text-gray-700">{viewItem.phone}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-24">Date:</span><span className="text-gray-700">{viewItem.date}</span></div>
                <div className="flex gap-4"><span className="text-gray-500 w-24">Status:</span><span className="inline-block px-3 py-1 text-xs border border-gray-300 rounded text-gray-700">{viewItem.status}</span></div>
                <div><span className="text-gray-500">Message:</span><p className="mt-1 text-gray-900 border border-gray-200 rounded p-3 bg-gray-50">{viewItem.message}</p></div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setViewItem(null)} className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && <CreateTextMessageModal onClose={() => setShowCreateModal(false)} />}

    </div>
  );
}