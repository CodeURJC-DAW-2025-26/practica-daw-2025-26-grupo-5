// User data object returned from backend /v1/users/me endpoint
// Fields: From database User entity
// MODIFY: Add fields if backend adds new user attributes (phone, address, etc.)
export default interface UserDTO {
  id: number;
  name: string;
  email: string;
  rating: number;
  numRatings: number;
  description: string;
  cardNumber?: string;
  cardExpiringDate?: string;
  cardCvv?: string;
  roles: string[];
  banned: boolean;
}
