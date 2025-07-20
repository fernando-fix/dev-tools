import SideBar from "./SideBar";

type Props = {
    children: React.ReactNode;
    pageTitle?: string;
}

export default function Default({ children, pageTitle }: Props) {
    return (
        <>
            <div className="bg-gray-900 text-white h-screen flex overflow-hidden">

                <SideBar />

                {/* Main Content' */}
                <main className="flex-1 bg-gray-800 rounded-lg m-4 ms-0 p-4 shadow-inner overflow-auto">
                    {pageTitle && (
                        <>
                            <h1 className="text-2xl font-semibold mb-4">{pageTitle}</h1>
                            <hr className="border-gray-600 mb-4" />
                        </>
                    )}
                    {children}
                </main>

            </div>
        </>
    );
}