import type UserDTO from "./UserDTO";
import type ProductDTO from "./ProductDTO";

export default interface TransactionDTO {
  transactionId: number;
  finalPrice: number;
  createdAt: string; // LocalDateTime
  formattedDate: string;
  transactionStatus: string;
  rated: boolean;
  stars: number | null;
  seller: UserDTO;
  buyer: UserDTO;
  product: ProductDTO;
}
