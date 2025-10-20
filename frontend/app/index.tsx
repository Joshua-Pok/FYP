import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Home screen</Text>
			<Link href="/about" style={styles.button}>
				Go to About screen
			</Link>
			<Link href="/login" style={styles.button}>
				Go to Login Screen
			</Link>
			<Link href="/home" style={styles.button}>
				Go to Home screen
			</Link>

			<Link href="/profilepage" style={styles.button}>
				Go to ProfilePage
			</Link>
			<Link href="/createtrip" style={styles.button}>
				Go to create trip
			</Link>
			<Link href="/personalityquiz" style={styles.button}>
				Go to Personality Quiz
			</Link>
			<Link href="/Signup" style={styles.button}>
				Go to Signup Page
			</Link>

			<Link href="/ItineraryScreen" style={styles.button}>
				Go to Trips Page
			</Link>
			<Link href="/createactivity" style={styles.button}>
				Go to CreateaCtivity
			</Link>
			<Link href="/CreateItinerary" style={styles.button}>
				Go to CreateItinerary
			</Link>



		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#25292e",
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		color: "#fff",
	},
	button: {
		fontSize: 20,
		textDecorationLine: "underline",
		color: "#fff",
	},
});
