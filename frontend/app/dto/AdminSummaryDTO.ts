import type UserDTO from './UserDTO';
import type ProductDTO from './ProductDTO';

interface AdminSummaryDTO {
  readonly numUsers: number;
  readonly numBanneds: number;
  readonly memoryUsage: string;
  readonly recentUsers: readonly UserDTO[];
  readonly recentProducts: readonly ProductDTO[];
  readonly totalProductCount: number;
  readonly totalRevenue: number;
}

export default AdminSummaryDTO;
