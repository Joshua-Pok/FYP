import { api } from './api';


interface CreateCountryRequest {
	name: string;
}


const CreateCountry = async (data: CreateCountryRequest) => {
	const response = await api.post("/country", data);
	return response.data
}


const GetAllCountries = async () => {
	const response = await api.get("/country");
	return response.data
}


export default {
	CreateCountry,
	GetAllCountries
}
