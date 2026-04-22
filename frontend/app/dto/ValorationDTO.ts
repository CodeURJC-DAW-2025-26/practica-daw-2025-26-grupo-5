// Review/Rating data: User rating another user after transaction
// MODIFY: Add photo support if valorations should include buyer photos
export default interface ValorationDTO {
  id: number;
  rating: number;
  comment: string;
  buyerName: string;
  sellerName: string;
  transactionId: number;
}
