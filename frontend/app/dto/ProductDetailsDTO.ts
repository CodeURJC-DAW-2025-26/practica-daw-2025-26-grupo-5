import type ProductDTO from "./ProductDTO";

export default interface ProductDetailsDTO {
  product: ProductDTO;
  recommendedProducts: ProductDTO[];
  logged: boolean;
}
