import { useState } from 'react';
import {
    IconHome2,
    IconGauge,
    IconDeviceDesktopAnalytics,
    IconCalendarStats,
    IconUser,
    IconFingerprint,
    IconSettings,
    IconSun,
    IconMoon,
} from '@tabler/icons-react';
import { useComputedColorScheme, useMantineColorScheme, useMantineTheme } from '@mantine/core';

const mainLinks = [
    { icon: IconHome2, label: 'Home' },
    { icon: IconGauge, label: 'Dashboard' },
    { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
    { icon: IconCalendarStats, label: 'Releases' },
    { icon: IconUser, label: 'Account' },
    { icon: IconFingerprint, label: 'Security' },
    { icon: IconSettings, label: 'Settings' },
];

export default function Sidebar() {
    const { setColorScheme } = useMantineColorScheme();

    const colorMode = useComputedColorScheme("dark");

    const [active, setActive] = useState('Dashboard');
    const theme = useMantineTheme();
    const primaryColor = theme.colors[theme.primaryColor][6]; // medium shade of primary color

    const toggleTheme = () => {
        setColorScheme(colorMode === 'dark' ? 'light' : 'dark');
    };

    const darkMode = colorMode === 'dark';
    return (
        <nav
            className={`h-[calc(100vh-4rem)] w-20 flex flex-col border-r transition-colors duration-200
      ${darkMode ? 'border-gray-800 bg-gray-900 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}
    `}
        >


            {/* Main Links */}
            <div className="flex flex-col items-center gap-3 mt-6 flex-1">
                {mainLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = active === link.label;

                    return (
                        <button
                            key={link.label}
                            onClick={() => setActive(link.label)}
                            className={`group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all`}
                            style={{
                                backgroundColor: isActive
                                    ? primaryColor
                                    : 'transparent',
                                color: isActive
                                    ? '#fff'
                                    : darkMode
                                        ? '#d1d5db' // gray-300
                                        : '#4b5563', // gray-600
                            }}
                        >
                            <Icon size={22} stroke={1.6} />
                            <span
                                className={`absolute left-14 text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                  ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900'}
                `}
                            >
                                {link.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div
                className={`flex flex-col justify-center items-center h-20 border-t gap-3 transition-colors
        ${darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'}
      `}
            >
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-700 dark:hover:bg-gray-200"
                >
                    {darkMode ? (
                        <IconSun size={20} stroke={1.6} className="text-yellow-400" />
                    ) : (
                        <IconMoon size={20} stroke={1.6} className="text-gray-700" />
                    )}
                </button>

                <span className="text-xs">v1.0.0</span>
            </div>
        </nav>
    );
}
