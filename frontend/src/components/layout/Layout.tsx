import { useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
    const colorMode = useComputedColorScheme("dark");





    const darkMode = colorMode === 'dark';
    return (
        <>
            <Header />
            <div className={`flex h-[calc(100vh-4rem)] text-gray-900 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>

                <Sidebar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </>
    );
};

export default Layout;
