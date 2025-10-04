import { api } from "./api";

const getActivitiesByItinerary = async (itineraryId: number) => {
	try {
		const response = await api.get(`/activity?itinerary_id=${itineraryId}`);
		return response.data.activities
	} catch (err) {
		console.error("failed to fetch activities for thisitinerary");
		throw err
	}
};


export default {
	getActivitiesByItinerary
}
