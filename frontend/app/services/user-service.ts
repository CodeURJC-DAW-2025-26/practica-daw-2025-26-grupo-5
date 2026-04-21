/**
 * User Service
 *
 * This service module handles all user-related API communication with the Stilnovo backend.
 * It provides functions to fetch user profiles, dashboard data, and manage user settings.
 * All requests are made through the centralized api client which handles authentication tokens.
 *
 * Key Responsibilities:
 * - Retrieve user dashboard statistics (sales data, revenue, charts)
 * - Fetch seller public profiles for marketplace visibility
 * - Download user profile photos
 * - Update user settings (profile info, email, payment methods, etc.)
 * - Handle user deletion requests
 *
 * Data Flow:
 * Component → UserService → API Client → Backend → UserService → Component
 */

import api from "./api";
import type SellerDTO from "~/dto/SellerDTO";
import type UserDTO from "~/dto/UserDTO";

/**
 * Fetches comprehensive dashboard statistics for the authenticated user.
 *
 * This endpoint is used by sellers to view their business performance metrics.
 * Returns sales data, revenue information, charts, and sales transaction history.
 *
 * @returns Promise with dashboard data including:
 *   - revenueLabels: Array of date/time labels for the revenue chart
 *   - revenueValues: Array of revenue amounts corresponding to labels
 *   - chartLabels: Time period labels for additional charts
 *   - chartValues: Values for additional performance metrics
 *   - userSales: Array of individual sales transaction objects
 *   - formattedTotalRevenue: Total revenue formatted as currency string
 *   - formattedBalance: Available balance formatted as currency string
 *
 * @throws Returns default empty data structure on error to prevent UI crashes
 *
 * @example
 * const dashboardData = await getUserDashboardStats();
 * console.log(dashboardData.formattedTotalRevenue); // "1,250.50 EUR"
 */
export async function getUserDashboardStats() {
    try {
        return await api.get("/v1/users/me/dashboard");
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Return safe default structure to prevent undefined errors in UI
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
 * Fetches the public profile information for a specific seller in the marketplace.
 *
 * This endpoint retrieves seller details including their store name, description,
 * rating, number of sales, and other public profile information visible to potential buyers.
 * Used when viewing a seller's storefront or during product detail page display.
 *
 * @param userId - The unique identifier of the seller (can be string or number)
 *
 * @returns Promise<SellerDTO> Object containing seller profile data:
 *   - name: Store/seller display name
 *   - rating: Average seller rating from buyer valuations
 *   - salesCount: Total number of completed transactions
 *   - description: About the seller
 *   - joinDate: When the seller joined Stilnovo
 *   - etc.
 *
 * @throws HttpError if seller not found (404) or server error (5xx)
 *
 * @example
 * const sellerProfile = await getSellerProfile('user123');
 * console.log(`${sellerProfile.name} has ${sellerProfile.salesCount} sales`);
 */
export async function getSellerProfile(userId: string | number) {
    return await api.get<SellerDTO>(`/v1/users/${userId}/profile`);
}

/**
 * Fetches the profile photo/avatar image for a specific user.
 *
 * This endpoint serves the user's profile picture. The image is typically displayed
 * in the header navigation, user profile pages, and various UI components.
 * Returns the image file directly or a default placeholder if no photo is set.
 *
 * @param userId - The unique identifier of the user whose photo to retrieve
 *
 * @returns Promise with the image response (handled by the API client)
 *
 * @throws HttpError if user not found (404)
 *
 * @note
 * Image URLs can be cached busted with a timestamp query parameter (?t=Date.now())
 * to ensure fresh images when a user uploads a new profile photo
 *
 * @example
 * // Load profile photo with cache busting
 * const photoUrl = `/api/v1/users/${userId}/profile-photo?t=${Date.now()}`;
 * <img src={photoUrl} alt="Profile" />
 */
export async function getUserPhoto(userId: string | number) {
    return await api.get(`/v1/users/${userId}/profile-photo`);
}

/**
 * Updates the current authenticated user's profile and account settings.
 *
 * This endpoint handles form submissions for user profile modifications including:
 * - Profile picture upload
 * - Name and bio changes
 * - Email address updates
 * - Payment method/card information
 * - Location and other public profile details
 *
 * The function accepts FormData to support file uploads (particularly profile images).
 * The backend validates all inputs and returns the updated user object on success.
 *
 * @param formData - FormData object containing user settings:
 *   - name?: string - User's display name
 *   - email?: string - User's email address
 *   - bio?: string - User's profile biography
 *   - profilePhoto?: File - Profile picture upload
 *   - etc.
 *
 * @returns Promise<UserDTO> The updated user object after successful modification
 *
 * @throws HttpError if validation fails (400) or server error (5xx)
 *
 * @example
 * const formData = new FormData();
 * formData.append('name', 'John Doe');
 * formData.append('email', 'john@example.com');
 * const updatedUser = await updateUserSettings(formData);
 */
export async function updateUserSettings(formData: FormData): Promise<UserDTO> {
    return await api.patch<UserDTO>("/v1/users/me/profile", formData);
}

/**
 * Deletes the current authenticated user's account from the Stilnovo marketplace.
 *
 * This endpoint removes the user account and all associated data. Should typically
 * trigger a logout and redirect to home page after successful deletion.
 *
 * @returns Promise<UserDTO> The deleted user object
 *
 * @throws HttpError if user not authenticated (401) or server error (5xx)
 *
 * @warning This action is permanent and cannot be undone. Should be protected with
 * user confirmation dialogs in the UI.
 *
 * @example
 * if (window.confirm('Are you sure you want to permanently delete your account?')) {
 *   await deleteUser();
 *   logoutUser(); // Also clear auth state
 * }
 */
export async function deleteUser(){
    return await api.post<UserDTO>("/v1/users/me")
}