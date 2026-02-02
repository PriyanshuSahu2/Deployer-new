import React from "react";
import { useLocation } from "react-router-dom";
import { Avatar, Text, Group, useComputedColorScheme } from "@mantine/core";

const Header = () => {
    const location = useLocation();

    // Extract current route name (like '/dashboard' → 'Dashboard')
    const getPageTitle = () => {
        const path = location.pathname.replace("/app", "");
        if (!path) return "Home";
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    const pageTitle = getPageTitle();
    const colorMode = useComputedColorScheme("dark");

    const darkMode = colorMode === 'dark';

    return (
        <header
            className={`flex justify-between items-center px-6 h-16 border-b transition-colors duration-200 ${darkMode ? 'border-gray-800 bg-gray-900 text-gray-300' : 'border-gray-200 bg-white text-gray-900'}`}

        >
            <Text fw={600} size="lg">
                {pageTitle}
            </Text>

            <Group>
                <Avatar radius="xl" color="blue" size="md" src={null}>
                    PS
                </Avatar>
            </Group>
        </header>
    );
};

export default Header;
