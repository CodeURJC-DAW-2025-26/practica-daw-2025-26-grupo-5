import type UserDTO from "./UserDTO";
import type ProductDTO from "./ProductDTO";
import type ValorationDTO from "./ValorationDTO";

export default interface SellerDTO {
    seller: UserDTO;
    products: ProductDTO[];
    valorations: ValorationDTO[];
    fullStars: number;
    owner: boolean;
}