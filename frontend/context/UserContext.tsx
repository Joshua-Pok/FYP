import { createContext, ReactNode, useContext, useState } from "react"

interface User {
	id: number;
	name: string;
	email: string;
	token: string;
}

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType>({
	user: null,
	setUser: () => { },
})
export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	return (
		<UserContext.Provider value={{ user, setUser }} >
			{children}
		</UserContext.Provider >
	)
}


export const useUser = () => useContext(UserContext);
