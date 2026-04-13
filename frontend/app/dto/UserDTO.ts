export default interface UserDTO {
  id: number;
  name: string;
  email: string;
  rating: number;
  numRatings: number;
  description: string;
  roles: string[];
  banned: boolean;
}
