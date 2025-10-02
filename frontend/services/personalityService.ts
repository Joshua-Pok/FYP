import { api } from "./api";


interface CreatePersonalityRequest {
	user_id: number;
	openness: number;
	conscientiousness: number;
	extraversion: number;
	agreeableness: number;
	neuroticism: number;

}


const createPersonality = async (data: CreatePersonalityRequest) => {
	const response = await api.post("/personality", data);
	return response.data
}


const getPersonalityByUserId = async (UserId: number) => {
	const response = await api.get(`/personality?user_id=${UserId}`);
	return response.data;
}


export default {
	createPersonality,
	getPersonalityByUserId
}
