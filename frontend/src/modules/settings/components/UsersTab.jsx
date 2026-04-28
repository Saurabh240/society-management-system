import React, { useEffect, useState } from "react";
import { getUsers } from "@/modules/settings/api/settingsApi";
import InviteUserModal from "./InviteUserModal";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);

      // TEMP fallback 
      setUsers([
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "Admin",
          status: "Active",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "Manager",
          status: "Active",
        },
        {
          id: 3,
          name: "Bob Johnson",
          email: "bob@example.com",
          role: "Viewer",
          status: "Active",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading users...</div>;
  }

  return (
    <div>
      {/* Top Right Button */}
      <div className="flex justify-end mb-4">
       <Button onClick={() => setIsModalOpen(true)}>
       + Invite User
       </Button>
      </div>

      {/* Table Card */}
      <Card className="border border-gray-200">
        {/* Table Header */}
        <div className="grid grid-cols-4 px-6 py-4 border-b font-semibold text-gray-700">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
        </div>
        
        {users.length === 0 && (
    <div className="px-6 py-6 text-gray-400 text-sm">
      No users found.
    </div>
  )}



        {/* Table Body */}
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-4 px-6 py-4 border-b last:border-0 items-center"
          >
            <div className="text-gray-900">{user.name}</div>
            <div className="text-gray-700">{user.email}</div>
            <div className="text-gray-700">{user.role}</div>

            <div>
              <span
                className={`px-3 py-1 text-sm border rounded ${
                  user.status === "Active"
                    ? "bg-gray-100 border-gray-300 text-gray-800"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>
        ))}
      </Card>
    {/* Modal  */}
<InviteUserModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSuccess={fetchUsers}
/>


    </div>
  );
};

export default UsersTab;