export interface AccommodationImageResponse {
  statusCode: number;
  message: string;
  data: {
    accommodationImageId: number;
    imageUrl: string;
    publicId: string;
  };
}
