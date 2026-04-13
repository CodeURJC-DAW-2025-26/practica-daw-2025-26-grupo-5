export default interface AdminProductCreateRequestDTO {
  sellerId: number;
  name: string;
  category: string;
  description: string;
  price: number;
  location: string;
  status: string;
  image?: File;
}
