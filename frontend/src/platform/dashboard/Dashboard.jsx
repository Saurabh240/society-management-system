


import { Outlet } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">

   
      <Sidebar />

    
      <div className="flex-1 flex flex-col">

   
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">
            Dashboard
          </h1>

          <div className="text-sm text-gray-600">
            Welcome
          </div>
        </header>

     
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Dashboard;


