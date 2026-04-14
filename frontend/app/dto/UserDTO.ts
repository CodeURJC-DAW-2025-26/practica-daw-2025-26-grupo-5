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
