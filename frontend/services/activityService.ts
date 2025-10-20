import { Platform } from "react-native";
import { api } from "./api";
import * as FileSystem from 'expo-file-system'

interface CreateActivityData {
	name: string;
	title: string;
	price: number;
	address: string;
	countryid: number;
	image: {
		uri: string;
		type: string;
		name: string;
	}
}
const createActivity = async (data: CreateActivityData) => {
	const formData = new FormData();

	formData.append("name", data.name);
	formData.append("title", data.title);
	formData.append("price", String(data.price));
	formData.append("address", data.address);
	formData.append("countryid", String(data.countryid));

	if (data.image?.uri) {
		// Ensure uri starts with file://
		let uri = data.image.uri;
		if (Platform.OS === "ios" && uri.startsWith("ph://")) {
			// convert ph:// to file:// using expo-file-system
			const assetInfo = await FileSystem.getInfoAsync(uri);
			uri = assetInfo.uri;
		}

		formData.append("image", {
			uri,
			type: data.image.type || "image/jpeg",
			name: data.image.name || "upload.jpg",
		} as any);
	}

	const response = await api.post("/activity", formData);
	return response.data;
};

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


const getRecommendedActivitiesByCountry = async (userId: string, countryId: number) => {

	try {
		const response = await api.get("/activity", {
			params: {
				user_id: userId,
				country_id: countryId,
			},
		})
		return response.data.activities
	} catch (err) {
		console.error("failed to fetch recommended activities by country: ", err);
		return []
	}
}


const toggleLikeActivity = async (userId: string, activity_id: string, liked: boolean) => {
	try {
		const response = await api.put("/activity", { "liked": liked }, {
			params: {
				user_id: userId,
				activity_id: activity_id

			}
		})
		return response.data;
	} catch (err) {
		console.error("failed to toggle like: ", err);
	}
}


export default {
	getActivitiesByItinerary,
	getActivitiesByCountry,
	createActivity,
	getRecommendedActivitiesByCountry,
	toggleLikeActivity
}
