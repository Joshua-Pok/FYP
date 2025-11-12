import { useState } from "react";
import { BottomNavigation } from "react-native-paper";
import { StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Navbar() {
	const [index, setIndex] = useState(0);
	const [routes] = useState([
		{ key: "home", title: "Home", focusedIcon: "home", unfocusedIcon: "home-outline" },
		{ key: "trips", title: "Trips", focusedIcon: "airplane", unfocusedIcon: "airplane" },
		{ key: "Create", title: "Dummy", focusedIcon: "heart", unfocusedIcon: "heart-outline" },
		{ key: "profile", title: "Profile", focusedIcon: "account", unfocusedIcon: "account-outline" },
	]);

	const handleIndexChange = (newIndex: number) => {
		setIndex(newIndex);
		const routeKey = routes[newIndex].key;

		switch (routeKey) {
			case "home":
				router.push("/home");
				break;
			case "trips":
				router.push("/Trips");
				break;
			case "Create":
				router.push("/CreateItinerary");
				break;
			case "profile":
				router.push("/profilepage");
				break;
		}
	};

	return (
		<BottomNavigation.Bar
			navigationState={{ index, routes }}
			onIndexChange={handleIndexChange}
			renderScene={() => null}
		/>
	);
}

const styles = StyleSheet.create({});
