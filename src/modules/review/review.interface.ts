export interface ReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}