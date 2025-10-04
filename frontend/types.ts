export interface Activity {
	image: string;
	country: string;
	address: string;
	price: number;
	rating: number;
}

export interface Itinerary {
	id: number;
	user_id: number;
	title: string;
	description: string;
	start_date?: string;
	end_date?: string;

}
export interface ActivityItemProps {
	imageURL: string;
}
