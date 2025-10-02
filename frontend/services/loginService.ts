import { api } from "./api";

interface signupData {
	name: string
	username: string;
	email: string;
	password: string;
}

interface loginData {
	username: string,
	password: string,
}


interface loginResponse {
	success: boolean;
	token?: string;
	user?: {
		id: string;
		email: string;
		name: string;
	}
	message?: string
}


const signup = async (data: signupData) => {
	try {
		const response = await api.post('/signup', data);
		return response.data
	} catch (err) {
		console.error(err)
	}
}


const login = async (data: loginData): Promise<loginResponse> => {
	try {
		const response = await api.post('/login', data);
		if (response.data.token) {
			const token = response.data.token
			api.defaults.headers.common['Authorization'] = `Bearer ${token}`
		}
		return response.data
	} catch (err) {
		throw err;
	}
}




export default {
	signup,
	login,
}
