import { redirect } from "react-router";
import { useUserStore } from "~/stores/useUserStore";
import { getUserDashboardStats } from "~/services/user-service";

/**
 * Client-side loader function
 * Fetches dashboard statistics for the currently logged-in seller.
 * * Process:
 * 1. Checks for an active user session directly in the Zustand store.
 * 2. Redirects to login instantly if unauthorized (prevents UI flickering).
 * 3. Fetches dashboard data via REST API using clientLoader (Project requirement).
 * 4. Formats currency and dates for UI display.
 */
export async function sharedDashboardLoader() {
    const currentUser = useUserStore.getState().user;
    
    if (!currentUser) {
        throw redirect('/login');
    }
    try {
        const stats = await getUserDashboardStats();
        const apiData = stats || {};
        
        return {
            userSales: apiData.salesCount || [],
            
            // Doughnut chart data (Categories)
            chartLabels: apiData.chartLabels || [],       
            chartValues: apiData.chartValues || [],       
            
            // Line chart data (Revenue)
            revenueLabels: apiData.revenueLabels || [],   
            revenueValues: apiData.revenueValues || [],   
            
            // Bar chart data (Visits vs Interest)
            barLabels: apiData.barLabels || ["No Data"],
            visitsByCategory: apiData.visitsByCategory || [0],
            interestByCategory: apiData.interestByCategory || [0],
            
            // Formatted data (We use balance for both cases for compatibility)
            formattedTotalRevenue: (apiData.totalRevenue || 0).toFixed(2),
            formattedBalance: (apiData.balance || 0).toFixed(2),
            formattedInventoryValue: (apiData.balance || 0).toFixed(2),
            
            date: new Date().toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric'
            })
        };
    } catch (error: any) {
        if (error.status === 401 || error.response?.status === 401) {
            useUserStore.getState().setUser(null);
            throw redirect('/login');
        }
        throw error;
    }
}