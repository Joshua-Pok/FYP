import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/services/api";

const BASE_URL = "http://192.168.1.10:9001";
interface Activity {
	id: number;
	title: string;
	name: string;
	price: number;
	address: string;
	imageurl: string;
}

interface Itinerary {
	id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
}

export default function ViewTripScreen() {
	const params = useLocalSearchParams();
	const itineraryId = Number(params.id);
	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchItinerary();
	}, []);

	const fetchItinerary = async () => {
		try {
			setLoading(true);
			const res = await api.get(`/activity?itinerary_id=${itineraryId}`);

			console.log("API response:", res.data);

			if (Array.isArray(res.data.activities)) {
				setActivities(res.data.activities);
			} else {
				setActivities([]);
			}

		} catch (err) {
			console.error("Error fetching itinerary:", err);
			setError("Failed to load itinerary or activities.");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.activitiesHeader}>Activities ({activities.length})</Text>
			{activities.length > 0 ? (
				activities.map((activity) => (
					<View key={activity.id} style={styles.activityCard}>
						<Image
							source={{ uri: `http://192.168.1.10:9000${activity.imageurl}` }}
							style={styles.activityImage}
						/>
						<View style={styles.activityContent}>
							<Text style={styles.activityTitle}>{activity.title}</Text>
							<Text>{activity.name}</Text>
							<Text>${activity.price}</Text>
							<Text>{activity.address}</Text>
						</View>
					</View>
				))
			) : (
				<Text style={styles.noActivities}>No activities added yet.</Text>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 15, backgroundColor: "#f5f5f5" },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	title: { fontSize: 22, fontWeight: "bold", marginBottom: 5 },
	dates: { fontSize: 14, color: "#666", marginBottom: 10 },
	description: { fontSize: 16, color: "#444", marginBottom: 15 },
	activitiesHeader: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
	activityCard: { flexDirection: "row", marginBottom: 10, backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#ddd" },
	activityImage: { width: 100, height: 100 },
	activityContent: { flex: 1, padding: 10 },
	activityTitle: { fontSize: 16, fontWeight: "600", marginBottom: 3 },
	noActivities: { textAlign: "center", color: "#999", fontStyle: "italic", marginVertical: 20 },
	errorText: { color: "#ff3b30", fontSize: 16 },
});
