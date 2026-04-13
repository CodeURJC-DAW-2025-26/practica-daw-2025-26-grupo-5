import type ProductDTO from "./ProductDTO";
import type UserDTO from "./UserDTO";

export default interface CheckoutDTO {
  product: ProductDTO;
  buyer: UserDTO;
}
