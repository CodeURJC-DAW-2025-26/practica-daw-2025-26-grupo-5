import type ProductDTO from "./ProductDTO";
import type UserDTO from "./UserDTO";

// Payment checkout data - product summary before transaction creation
// MODIFY: Add warranty/insurance options if backend adds product protection
export default interface CheckoutDTO {
  product: ProductDTO;
  buyer: UserDTO;
}
