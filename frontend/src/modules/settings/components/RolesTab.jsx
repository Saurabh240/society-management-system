import { useEffect, useState } from "react";
import { getRoles, updateRolePermissions } from "@/modules/settings/api/settingsApi";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { toast } from "react-toastify";

// ── Menu items matching the Figma screenshot (15 menus) ──────────────────────
const MENUS = [
  { key: "DASHBOARD",           label: "Dashboard"            },
  { key: "ASSOCIATIONS",        label: "Associations"         },
  { key: "ASSOCIATION_UNITS",   label: "Association Units"    },
  { key: "OWNERSHIP_ACCOUNTS",  label: "Ownership Accounts"   },
  { key: "ACCOUNTING",          label: "Accounting"           },
  { key: "CHART_OF_ACCOUNTS",   label: "Chart of Accounts"    },
  { key: "GENERAL_LEDGER",      label: "General Ledger"       },
  { key: "BANKING",             label: "Banking"              },
  { key: "BILLS",               label: "Bills"                },
  { key: "BUDGETS",             label: "Budgets"              },
  { key: "COMMUNICATION",       label: "Communication"        },
  { key: "MAINTENANCE",         label: "Maintenance"          },
  { key: "REPORTS",             label: "Reports"              },
  { key: "FINANCIAL_REPORTS",   label: "Financial Reports"    },
  { key: "SETTINGS",            label: "Settings"             },
];

const defaultPermissions = (canView = true, canEdit = true, canDelete = true) =>
  MENUS.map((m) => ({ menuKey: m.key, canView, canEdit, canDelete }));

const derivePermissionsFromRole = (roleStr) => {
  switch (roleStr) {
    case "TENANT_ADMIN": return defaultPermissions(true,  true,  true);
    case "MANAGER":      return defaultPermissions(true,  true,  false);
    case "VIEWER":       return defaultPermissions(true,  false, false);
    default:             return defaultPermissions(false, false, false);
  }
};

// ── Checkbox ──────────────────────────────────────────────────────────────────
const PermCheckbox = ({ checked, disabled, onChange }) => (
  <input
    type="checkbox"
    checked={!!checked}
    disabled={disabled}
    onChange={onChange}
    className={`w-4 h-4 rounded accent-blue-600 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
  />
);

// ── Permission matrix table ───────────────────────────────────────────────────
const PermissionMatrix = ({ permissions, editable, onChange }) => (
  <table className="w-full table-auto border-collapse border-t border-gray-200">
    <thead>
      <tr className="bg-gray-50">
        <th className="p-3 text-xs font-semibold text-gray-600 text-left">Menu</th>
        <th className="p-3 text-xs font-semibold text-gray-600 text-center w-20">View</th>
        <th className="p-3 text-xs font-semibold text-gray-600 text-center w-20">Edit</th>
        <th className="p-3 text-xs font-semibold text-gray-600 text-center w-20">Delete</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-100">
      {MENUS.map((menu) => {
        const perm = permissions?.find((p) => p.menuKey === menu.key)
            ?? { menuKey: menu.key, canView: false, canEdit: false, canDelete: false };
        return (
          <tr key={menu.key} className="hover:bg-gray-50">
            <td className="p-3 text-sm text-gray-700">{menu.label}</td>
            <td className="p-3 text-center">
              <PermCheckbox checked={perm.canView}   disabled={!editable}
                onChange={(e) => onChange(menu.key, "canView",   e.target.checked)} />
            </td>
            <td className="p-3 text-center">
              <PermCheckbox checked={perm.canEdit}   disabled={!editable}
                onChange={(e) => onChange(menu.key, "canEdit",   e.target.checked)} />
            </td>
            <td className="p-3 text-center">
              <PermCheckbox checked={perm.canDelete} disabled={!editable}
                onChange={(e) => onChange(menu.key, "canDelete", e.target.checked)} />
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

// ── Role accordion row ────────────────────────────────────────────────────────
const RoleAccordion = ({ role, onEditPermissions }) => {
  const [expanded, setExpanded] = useState(role.isDefault);

  return (
    <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 cursor-pointer transition"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {expanded
            ? <ChevronDown  size={15} className="text-gray-500 flex-shrink-0" />
            : <ChevronRight size={15} className="text-gray-500 flex-shrink-0" />}
          <span className="font-semibold text-gray-900 text-sm">{role.displayName}</span>
          {role.isDefault && (
            <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded font-medium">Default</span>
          )}
          <span className="text-sm text-gray-400 ml-1 hidden md:block truncate">{role.description}</span>
          <span className="text-xs text-gray-400 ml-auto mr-4 flex-shrink-0">
            {role.userCount} user{role.userCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {role.isDefault ? (
            <span className="text-xs text-gray-400 italic hidden sm:block">Default role cannot be edited or deleted</span>
          ) : (
            <>
              <button
                onClick={() => onEditPermissions(role)}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Edit Permissions
              </button>
              <button
                onClick={() => toast.info("Custom role deletion — coming in the next release")}
                className="px-3 py-1.5 text-xs font-medium border border-red-200 rounded-md text-red-600 hover:bg-red-50 transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      {expanded && (
        <PermissionMatrix permissions={role.permissions} editable={false} onChange={() => {}} />
      )}
    </div>
  );
};

// ── Edit Permissions Modal ────────────────────────────────────────────────────
const EditPermissionsModal = ({ role, onClose, onSaved }) => {
  const [permissions, setPermissions] = useState(
    JSON.parse(JSON.stringify(role.permissions))
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (menuKey, field, value) => {
    setPermissions((prev) =>
      prev.map((p) => p.menuKey === menuKey ? { ...p, [field]: value } : p)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // ← REAL BACKEND CALL — PUT /api/v1/settings/roles/{id}/permissions
      await updateRolePermissions(role.id, permissions);
      toast.success(`Permissions for "${role.displayName}" saved`);
      onSaved(role.id, permissions);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            Edit Permissions — {role.displayName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="overflow-y-auto flex-1">
          <PermissionMatrix permissions={permissions} editable={true} onChange={handleChange} />
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main RolesTab ─────────────────────────────────────────────────────────────
const RolesTab = () => {
  const [roles,       setRoles]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      const raw = res.data?.data ?? [];

      const mapped = raw.map((r) => ({
        id:          r.role,
        role:        r.role,
        displayName: r.role === "TENANT_ADMIN" ? "Admin"
                   : r.role === "MANAGER"      ? "Manager"
                   : r.role === "VIEWER"        ? "Viewer"
                   : r.role,
        description: r.permissionLabel,
        userCount:   r.userCount,
        isDefault:   r.role === "TENANT_ADMIN",
        permissions: derivePermissionsFromRole(r.role),
      }));

      setRoles([
        ...mapped.filter((r) =>  r.isDefault),
        ...mapped.filter((r) => !r.isDefault),
      ]);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  // After saving permissions, update local state so accordion reflects new values
  const handlePermissionsSaved = (roleId, newPermissions) => {
    setRoles((prev) =>
      prev.map((r) => r.id === roleId ? { ...r, permissions: newPermissions } : r)
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-600">
          Configure role-based access to menus with view, edit, and delete permissions
        </p>
        <button
          onClick={() => toast.info("Custom role creation — coming in the next release")}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <Plus size={14} /> + Add Role
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400 text-sm">Loading roles...</div>
      ) : roles.length === 0 ? (
        <div className="py-10 text-center text-gray-500 text-sm">No roles found.</div>
      ) : (
        roles.map((role) => (
          <RoleAccordion key={role.id} role={role} onEditPermissions={setEditingRole} />
        ))
      )}

      {editingRole && (
        <EditPermissionsModal
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSaved={handlePermissionsSaved}
        />
      )}
    </div>
  );
};

export default RolesTab;