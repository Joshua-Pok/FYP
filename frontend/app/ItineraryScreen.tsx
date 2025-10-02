import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { api } from "@/services/api";
interface Activity {
	id: number;
	name: string;
	title?: string;
	price?: number;
	address?: string;
	imageurl?: string;
	country_id?: number;
}

interface Itinerary {
	id: number;
	user_id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	Activities: Activity[];
}


export default function ItinerariesScreen({ userId }: { userId: number }) {
	const [itineraries, setItineraries] = useState<Itinerary[]>([]);
	const [loading, setLoading] = useState(true);

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

	useEffect(() => {
		fetchItineraries();
	}, []);


	const renderItem = ({ item }: { item: Itinerary }) => (
		<TouchableOpacity style={styles.card}>
			<Text style={styles.title}>{item.title}</Text>
			<Text style={styles.description}>{item.description}</Text>
			<Text style={styles.dates}>
				{new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
			</Text>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#4caf50" />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={itineraries}
				keyExtractor={(item) => item.id.toString()}
				renderItem={renderItem}
				contentContainerStyle={{ padding: 10 }}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	card: {
		backgroundColor: "#f9f9f9",
		padding: 20,
		marginVertical: 10,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 3,
	},
	title: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 5,
	},
	description: {
		fontSize: 16,
		color: "#555",
		marginBottom: 10,
	},
	dates: {
		fontSize: 14,
		color: "#888",
	},
});
