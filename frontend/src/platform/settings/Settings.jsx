import { NavLink, Outlet } from "react-router-dom";

export default function Settings() {
  return (
    <div className="flex h-full">


      <div className="w-64 border-r bg-white p-4 space-y-2">

        <h2 className="text-lg font-semibold mb-4">
          Settings
        </h2>

        <NavLink
          to="tenants"
          end
          className={({ isActive }) =>
            `block px-3 py-2 rounded-md text-sm transition ${
              isActive
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`
          }
        >
          Tenants
        </NavLink>

        <NavLink
  to="communities"
  end
  className={({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm transition ${
      isActive
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-gray-600 hover:bg-gray-100"
    }`
  }
>
  Communities
</NavLink>

      

      </div>

   
      <div className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </div>

    </div>
  );
}
