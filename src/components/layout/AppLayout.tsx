import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
        
        {/* Mobile Bottom Nav */}
        <BottomNav />
      </div>
    </div>
  );
}
