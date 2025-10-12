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


const getActivitiesByCountry = async (countryId: number) => {
	try {
		const response = await api.get('/activity', {
			params: { country_id: countryId },
		})
		return response.data;
	} catch (err) {
		console.error("failed to fetch activities for country", err)
		return []
	}
}


export default {
	getActivitiesByItinerary,
	getActivitiesByCountry
}
