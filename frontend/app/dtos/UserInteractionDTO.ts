export type InteractionType = "VIEW" | "PURCHASE" | "FAVORITE";

export default interface UserInteractionDTO {
  id: number;
  userId: number;
  type: InteractionType;
}
