import { api } from "./api";


interface ActivityScheduleInput {
	activity_id: number;
	day_number: number;
	start_time?: string | null;
	end_time?: string | null;
	order_in_day?: number | null;
}


interface Activity {
	id: number;
	name: string;
	title: string;
	price: number;
	address: string;
	imageurl: string;
	country_id: number;
}


interface ActivityWithDay {
	activity: Activity;
	day_number: number;
	start_time?: string | null;
	end_time?: string | null;
	order_in_day?: number | null;
}


interface ItineraryDay {
	day_number: number;
	date: string;
	activities: ActivityWithDay[];

}


interface Itinerary {
	id: number;
	user_id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	activities?: Activity[];
	activities_with_day?: ActivityWithDay[];
}

interface CreateItineraryRequest {
	user_id: number;
	title: string;
	description: string;
	start_date: string; //ISO string
	end_date: string; //ISO string
	activities: ActivityScheduleInput;
}


interface ModifyItineraryRequest {
	id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	activities: ActivityScheduleInput[];
}

const getItinerariesByUser = async (userId: number): Promise<Itinerary[]> => {
	const response = await api.get(`/itinerary?user_id=${userId}`);
	return response.data;
}


const createItinerary = async (data: CreateItineraryRequest): Promise<Itinerary> => {
	const response = await api.post('/itinerary', data);
	return response.data.data;
}


const modifyItinerary = async (data: ModifyItineraryRequest) => {
	const response = await api.put("/itinerary", data);
	return response.data.itinerary;
}


export default {
	getItinerariesByUser,
	createItinerary,
	modifyItinerary
}
