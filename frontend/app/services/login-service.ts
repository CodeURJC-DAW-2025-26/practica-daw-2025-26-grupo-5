import api, { HttpError } from "./api";
import type UserDTO from "~/dto/UserDTO";

/**
 * Login Service
 * Handles authentication with the Stilnovo backend
 */

/**
 * Check if user is logged in and get current user data
 */
export async function reqIsLogged(): Promise<UserDTO> {
  return await api.get<UserDTO>("/v1/users/me");
}

/**
 * Login with username and password
 */
export async function logIn(username: string, password: string): Promise<UserDTO> {
  return await api.post<UserDTO>("/v1/auth/login", {
    username,
    password,
  });
}

/**
 * Logout user
 */
export async function logOut(): Promise<void> {
  await api.post("/v1/auth/logout", {});
}
