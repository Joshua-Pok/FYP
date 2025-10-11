import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage";
import personalityService from "@/services/personalityService";

interface personality {
	id: number;
	userId: number;
	openness: number;
	conscientiousness: number;
	extraversion: number;
	agreeableness: number;
	neuroticism: number;
}
interface User {
	id: number;
	name: string;
	email: string;
	token: string;
	personality?: personality
}

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	loading: boolean;
}

const UserContext = createContext<UserContextType>({
	user: null,
	setUser: () => { },
	loading: true,
})
export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUserState] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const storedUser = await AsyncStorage.getItem("user");
				if (storedUser) {
					const parsedUser: User = JSON.parse(storedUser);

					const personality = await personalityService.getPersonalityByUserId(user!.id);
					const updatedUser = { ...parsedUser, personality }

					setUserState(updatedUser);
					await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
				}
			} catch (err) {
				console.error("Error loading user: ", err)
			} finally {
				setLoading(false)
			}
		}
		loadUser();
	}, [user])

	const setUser = async (user: User | null) => {
		try {
			if (user) {
				await AsyncStorage.setItem("user", JSON.stringify(user));
			} else {
				await AsyncStorage.removeItem("user");
			}
			setUserState(user);
		} catch (err) {
			console.error("Error saving user: ", err);
		}
	}

	return (
		<UserContext.Provider value={{ user, setUser, loading }} >
			{children}
		</UserContext.Provider >
	)
}


export const useUser = () => useContext(UserContext);
