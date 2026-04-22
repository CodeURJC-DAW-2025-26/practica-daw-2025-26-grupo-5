import type ImageDTO from "./ImageDTO";
import type UserDTO from "./UserDTO";
import type UserInteractionDTO from "./UserInteractionDTO";

// Product data object from /v1/products endpoints
// MODIFY: Add fields if backend product schema expands (condition, warranty, etc.)
export default interface ProductDTO {
  id: number;
  name: string;
  category: string;
  price: number;
  location: string;
  description: string;
  status: string;
  image: ImageDTO;
  seller: UserDTO;
  userInteractions: UserInteractionDTO[];
}
