import api from "./api";
import type UserDTO from "~/dtos/UserDTO";

/**
 * HttpError: Custom error class for HTTP errors
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/**
 * Login Service
 * Handles authentication with the Stilnovo backend
 */

/**
 * Check if user is logged in and get current user data
 */
export async function reqIsLogged(): Promise<UserDTO> {
  try {
    const response = await api.get("/v1/users/me");
    if (response.status === 200) {
      return response.data;
    }
    throw new HttpError(response.status, "Not logged in");
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new HttpError(401, "Not authenticated");
    }
    throw error;
  }
}

/**
 * Login with username and password
 */
export async function logIn(username: string, password: string): Promise<void> {
  const response = await api.post("/v1/auth/login", {
    username,
    password,
  });

  if (response.status !== 200) {
    throw new HttpError(response.status, "Login failed");
  }
}

/**
 * Logout user
 */
export async function logOut(): Promise<void> {
  const response = await api.post("/v1/auth/logout");

  if (response.status !== 200) {
    throw new HttpError(response.status, "Logout failed");
  }
}
