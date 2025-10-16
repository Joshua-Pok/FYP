import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	ActivityIndicator,
} from "react-native";
import { Button } from "react-native-paper";
import { api } from "@/services/api";
import { router } from "expo-router";
import { useUser } from "@/context/UserContext";

interface Itinerary {
	id: number;
	user_id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
}

export default function ItinerariesScreen() {
	const [itineraries, setItineraries] = useState<Itinerary[]>([]);
	const [loading, setLoading] = useState(true);
	const { user } = useUser();

	const userId = user!.id
	useEffect(() => {
		const fetchItineraries = async () => {
			try {
				const response = await api.get(`/itinerary?user_id=${userId}`);
				setItineraries(response.data);
			} catch (err) {
				console.error("Failed to fetch itineraries", err);
			} finally {
				setLoading(false);
			}
		};
		fetchItineraries();
	}, [userId]);

	const handleItinerarySelect = (id: number) => {
		console.log("Viewing itinerary:", id);
		router.push(`/ViewTripScreen/${id}`);
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#4caf50" />
			</View>
		);
	}

	if (itineraries.length === 0) {
		return (
			<View style={styles.centered}>
				<Text style={styles.emptyText}>No itineraries found</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={itineraries}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<Text style={styles.title}>{item.title}</Text>
						<Text style={styles.description}>{item.description}</Text>
						<Text style={styles.dates}>
							{new Date(item.start_date).toLocaleDateString()} -{" "}
							{new Date(item.end_date).toLocaleDateString()}
						</Text>
						<Button
							mode="contained"
							onPress={() => handleItinerarySelect(item.id)}
							style={styles.button}
						>
							View Trip
						</Button>
					</View>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff", padding: 10 },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	card: {
		backgroundColor: "#f9f9f9",
		padding: 20,
		marginVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#ddd",
	},
	title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
	description: { color: "#555", marginBottom: 8 },
	dates: { color: "#888", marginBottom: 10 },
	emptyText: { fontSize: 16, color: "#999" },
	button: { marginTop: 10 },
});
