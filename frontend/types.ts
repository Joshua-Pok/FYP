export interface Activity {
  image: string;
  country: string;
  address: string;
  price: number;
  rating: number;
}

export interface Itinerary {
  activities: Activity[];
  startDate: Date;
  endDate: Date;
}
export interface ActivityItemProps {
  imageURL: string;
}
