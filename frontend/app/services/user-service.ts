import api from "./api";
import type SellerDTO from "~/dto/SellerDTO";
import type UserDTO from "~/dto/UserDTO";

/**
 * Fetch dashboard statistics for the logged-in user
 */
export async function getUserDashboardStats() {
    try {
        return await api.get("/v1/users/me/dashboard");
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
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
 * Fetch public profile of sellers
 */
export async function getSellerProfile(userId: string | number) {
    return await api.get<SellerDTO>(`/v1/users/${userId}/profile`);
}

/**
 * Fetch user profile photo
 */
export async function getUserPhoto(userId: string | number) {
    return await api.get(`/v1/users/${userId}/profile-photo`);
}

/**
 * Update user settings (profile, email, card info, etc.)
 */
export async function updateUserSettings(formData: FormData): Promise<UserDTO> {
    return await api.patch<UserDTO>("/v1/users/me/profile", formData);
}