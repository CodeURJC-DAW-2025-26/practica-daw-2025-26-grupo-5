import type ProductDTO from "./ProductDTO";
import type UserDTO from "./UserDTO";

export default interface HomePageDTO {
  products: ProductDTO[];
  recommendedProducts: ProductDTO[];
  user: UserDTO | null;
  logged: boolean;
  admin: boolean;
  query: string;
  searching: boolean;
  last: boolean;
}
