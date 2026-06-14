import { AppHeader, BottomNav, SidebarNav } from "@/components/layout/app-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <SidebarNav />
        <div className="flex flex-1 flex-col pb-20 lg:pb-0">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
