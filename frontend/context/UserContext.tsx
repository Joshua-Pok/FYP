import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
	id: number;
	name: string;
	email: string;
	token: string;
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
					setUser(JSON.parse(storedUser));
				}
			} catch (err) {
				console.error("Error loading user: ", err)
			} finally {
				setLoading(false)
			}
		}
		loadUser();
	}, [])

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
