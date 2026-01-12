import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block print:hidden">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        <main className="flex-1 pb-20 lg:pb-0 print:pb-0">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden print:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
