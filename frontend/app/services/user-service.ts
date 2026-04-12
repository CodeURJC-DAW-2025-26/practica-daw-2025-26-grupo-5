import axios from "axios";

/**
 * Fetch dashboard statistics for the logged-in user
 */
export async function getUserDashboardStats() {
    try {
        // La URL debe coincidir con tu RestController de Java
        const response = await axios.get("/api/v1/users/me/dashboard");

        // Devolvemos directamente los datos (el objeto con revenueLabels, sales, etc.)
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Devolvemos un objeto vacío o valores por defecto para que el 'spread' (...) no falle
        return {
            revenueLabels: [],
            revenueValues: [],
            chartLabels: [],
            chartValues: [],
            userSales: [],
            formattedTotalRevenue: "0.00",
            formattedBalance: "0.00"
        };
    }
}

/**
 * Fetch public profile of any user
 */
export async function getUserProfile(userId: string | number) {
    const response = await axios.get(`/api/v1/users/${userId}`);
    return response.data;
}