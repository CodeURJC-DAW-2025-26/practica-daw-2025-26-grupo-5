import type ProductDTO from "./ProductDTO";
import type UserDTO from "./UserDTO";

// Homepage data: Marketplace catalog with products and categories
// MODIFY: Add featured/trending products section if homepage redesigned
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
