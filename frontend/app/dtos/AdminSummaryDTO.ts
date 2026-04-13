import type UserDTO from './UserDTO';
import type ProductDTO from './ProductDTO';

export default interface AdminSummaryDTO {
  numUsers: number;
  numBanneds: number;
  memoryUsage: number;
  users: UserDTO[];
  products: ProductDTO[];
}
