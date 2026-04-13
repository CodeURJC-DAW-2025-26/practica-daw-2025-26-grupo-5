/**
 * Frontend DTO for Product Creation/Edition
 * Matches the Java ProductWriteRequestDTO.java
 */
export default interface ProductWriteRequestDTO {
  name: string;        
  category: string;
  price: number;
  location: string;
  description: string;
  status: string;     
  file: File;
}