import { api } from "./api";

interface CreateItineraryRequest {
	user_id: number;
	title: string;
	description: string;
	start_date: string; //ISO string
	end_date: string; //ISO string
	activities: { id: number }[];
}


interface ModifyItineraryRequest {
	id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	activities: { id: number }[]
}

const getItinerariesByUser = async (userId: number) => {
	const response = await api.get(`/itinerary?user_id=${userId}`);
	return response.data;
}


const createItinerary = async (data: CreateItineraryRequest) => {
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
