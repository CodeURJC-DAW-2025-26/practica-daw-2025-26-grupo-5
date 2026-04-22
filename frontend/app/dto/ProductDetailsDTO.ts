import type ProductDTO from "./ProductDTO";

// Detailed product information including seller details and reviews
// MODIFY: Add seller shipping methods if backend adds delivery options
export default interface ProductDetailsDTO {
  product: ProductDTO;
  recommendedProducts: ProductDTO[];
  logged: boolean;
}
