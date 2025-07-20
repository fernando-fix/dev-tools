import { sidebarRoutes } from "../data/sidebarRoutes";

export default function SideBar() {
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
                    <input type="text" placeholder="Filtrar" className="w-full px-3 py-2 rounded-md bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled />
                    <nav className="flex flex-col space-y-2">

                        {/* Foreach de rotas */}
                        {sidebarRoutes.map((route, index) => (
                            <a
                                key={index}
                                href={route.url}
                                className={`w-full text-left px-4 py-2 rounded-md hover:bg-blue-500 ${route.url === document.location.pathname ? 'bg-blue-500' : 'bg-gray-500'}`}
                            >
                                {route.label}
                            </a>
                        ))}

                    </nav>
                </div>
            </aside>
        </>
    );
}