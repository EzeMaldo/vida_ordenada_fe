import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { AuthProvider } from "@/providers/AuthProvider";
import { SyncProvider } from "@/providers/SyncProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SyncProvider>
        <div className="flex h-screen bg-bg-primary overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </SyncProvider>
    </AuthProvider>
  );
}
