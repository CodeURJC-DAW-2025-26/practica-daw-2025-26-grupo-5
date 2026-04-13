import type ProductDTO from "./ProductDTO";
import type UserDTO from "./UserDTO";

export default interface InquiryDTO {
  id: number;
  productName: string;
  sellerEmail: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  inquiryType: string;
  message: string;
  createdAt: string; // LocalDateTime
  status: string;
  product: ProductDTO;
  buyer: UserDTO;
}
