import { Appbar, Menu } from "react-native-paper";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { router } from "expo-router";

export default function Header() {
	const { user, setUser } = useUser();

	const [menuVisible, setMenuVisible] = useState(false);
	const handleLogout = () => {
		setUser(null);
		setMenuVisible(false);
		router.push("/")
	}
	const handleLogin = () => {
		setMenuVisible(false);
		router.push("/login")
	}
	return (
		<>
			<Appbar.Header>
				<Appbar.Content title={user ? `Welcome Back ${user.name}!` : `Welcome!`} />
				<Menu
					visible={menuVisible}
					onDismiss={() => setMenuVisible(false)}
					anchor={
						<Appbar.Action
							icon="dots-vertical"
							onPress={() => setMenuVisible(true)}
						/>
					}
				>
					{user ? (
						<Menu.Item onPress={handleLogout} title="Logout" />
					) : (
						<Menu.Item onPress={handleLogin} title="Login" />
					)}
				</Menu>
			</Appbar.Header>
		</>
	);
}
