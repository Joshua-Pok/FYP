import { useUser } from "@/context/UserContext";
import itineraryService from "@/services/itineraryService";
import { Itinerary } from "@/types";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native-paper";
import { FlatList, View, StyleSheet } from "react-native";

export default function Trips() {
	const { user } = useUser();
	const [itineraries, setItineraries] = useState<Itinerary[]>([]);
	const [loading, setLoading] = useState(true);


	useEffect(() => {
		const fetchAllItineraries = async () => {
			if (!user) return;

			try {
				const result = await itineraryService.getItinerariesByUser(user.id)
				setItineraries(result || [])

			} catch (err) {
				console.error("Failed to fetch itineraries: ", err)
			} finally {
				setLoading(false);
			}

		}
		fetchAllItineraries();
	}, [user])


	if (loading) {
		return (
			<View>
				<ActivityIndicator size="large"></ActivityIndicator>
			</View>
		)
	}

	if (!itineraries.length) {
		return (
			<View>
				<Text>No Trips Found!</Text>
			</View>
		)
	}


	return (
		<FlatList
			data={itineraries}
			keyExtractor={(item) => item.id.toString()}
			renderItem={({ item }) => (
				<View style={styles.card}>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.desc}>{item.description}</Text>
					{item.start_date && item.end_date ? (
						<Text>{item.start_date} to {item.end_date}</Text>
					) : <Text>No start/end date</Text>}
				</View>
			)}
		>

		</FlatList>
	)
}


const styles = StyleSheet.create({
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	list: {
		padding: 16,
	},
	card: {
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 4,
	},
	desc: {
		fontSize: 14,
		color: "#555",
		marginBottom: 6,
	},
	dates: {
		fontSize: 12,
		color: "#888",
	},
});
