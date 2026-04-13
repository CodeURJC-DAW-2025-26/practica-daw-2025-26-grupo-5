import { Outlet } from 'react-router';
import Sidebar from '~/components/Sidebar';

export default function UserLayout() {

    const userLinks = [
        { to: "/user/page", label: "Dashboard", icon: "fa-chart-pie" },
        { to: "/user/products", label: "My Products", icon: "fa-box-open" },
        { to: "/user/sales-orders", label: "Sales & Orders", icon: "fa-handshake" },
        { to: "/user/valorations", label: "My Valorations", icon: "fa-star" },
        { to: "/user/statistics", label: "Statistics", icon: "fa-magnifying-glass-chart" },
        { to: "/user/settings", label: "Settings", icon: "fa-user-gear" },
        //{ to: "/user-help-center", label: "Help Center", icon: "text-muted fa-solid fa-circle-question" },
    ];

    return (
        <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8fafc' }}>

            <Sidebar title="My Menu" links={userLinks} isAdmin={false} />

            <main className="flex-grow-1 overflow-auto" style={{ maxHeight: '100vh' }}>
                <div className="p-4 p-md-5">
                    {/* Aquí es donde se renderizará el contenido de user-page.tsx */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
}