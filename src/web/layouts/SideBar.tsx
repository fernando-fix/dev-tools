import { useState } from "react";
import { sidebarRoutes } from "../data/sidebarRoutes";
import { Link } from "react-router-dom";

export default function SideBar() {
    const [filter, setFilter] = useState("");

    return (
        <>
            {/* Sidebar */}
            <aside className="p-4 h-full">
                <div className="flex h-full flex-col space-y-4 bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-lg font-semibold">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4l12 6-12 6V4z" />
                        </svg>
                        <span>DEV TOOLS</span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filtrar"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {filter && (
                            <button
                                onClick={() => setFilter('')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                    <nav className="flex flex-col space-y-2">
                        {/* Filtered routes */}
                        {sidebarRoutes
                            .filter((route) => route.label.toLowerCase().includes(filter.toLowerCase()))
                            .map((route, index) => (
                                <Link
                                    key={index}
                                    to={route.url}
                                    className={`w-full text-left px-4 py-2 rounded-md hover:bg-blue-500 ${window.location.hash === `#${route.url}` ? 'bg-blue-500' : 'bg-gray-500'}`}
                                >
                                    {route.label}
                                </Link>
                            ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}

