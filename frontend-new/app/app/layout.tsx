import Sidebar from "@/components/layout/Sidebar.client";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1">
        {/* <Header /> */}
        <main>{children}</main>
      </div>
    </div>
  );
}
