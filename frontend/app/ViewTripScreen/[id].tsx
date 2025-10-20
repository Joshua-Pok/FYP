import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import activityService from "../../services/activityService"; // adjust path if needed

export default function ViewTripScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [activities, setActivities] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;
		const fetchActivities = async () => {
			try {
				const data = await activityService.getActivitiesByItinerary(Number(id));
				setActivities(data);
			} catch (err) {
				console.error(err);
				setError("Failed to load activities.");
			} finally {
				setLoading(false);
			}
		};

		fetchActivities();
	}, [id]);

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#000" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={{ color: "red" }}>{error}</Text>
			</View>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			{activities.length === 0 ? (
				<Text style={styles.emptyText}>No activities found for this itinerary.</Text>
			) : (
				activities.map((day, dayIndex) => (
					<View key={dayIndex} style={styles.dayContainer}>
						<Text style={styles.dayTitle}>Day {day.DayNumber}</Text>

						{day.Activities.map((item: any, index: number) => (
							<View key={index} style={styles.card}>
								{item.Activity.imageurl ? (
									<Image
										source={{ uri: item.Activity.imageurl }}
										style={styles.image}
										resizeMode="cover"
									/>
								) : (
									<View style={[styles.image, styles.placeholder]}>
										<Text style={styles.placeholderText}>No Image</Text>
									</View>
								)}

								<View style={styles.cardContent}>
									<Text style={styles.activityName}>{item.Activity.name}</Text>
									<Text style={styles.activityTitle}>{item.Activity.title}</Text>
									<Text style={styles.activityAddress}>{item.Activity.address}</Text>
									<Text style={styles.activityPrice}>${item.Activity.price}</Text>

									{item.StartTime && item.EndTime && (
										<Text style={styles.timeText}>
											{formatTime(item.StartTime)} - {formatTime(item.EndTime)}
										</Text>
									)}
								</View>
							</View>
						))}
					</View>
				))
			)}
		</ScrollView>
	);
}

const formatTime = (isoString: string) => {
	const date = new Date(isoString);
	const hours = date.getUTCHours().toString().padStart(2, "0");
	const minutes = date.getUTCMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}`;
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: {
		textAlign: "center",
		marginTop: 50,
		fontSize: 16,
		color: "#555",
	},
	dayContainer: {
		marginBottom: 24,
	},
	dayTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 12,
		color: "#222",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		overflow: "hidden",
	},
	image: {
		width: "100%",
		height: 180,
	},
	placeholder: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#ddd",
	},
	placeholderText: {
		color: "#777",
	},
	cardContent: {
		padding: 12,
	},
	activityName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
	},
	activityTitle: {
		fontSize: 14,
		color: "#666",
		marginVertical: 4,
	},
	activityAddress: {
		fontSize: 13,
		color: "#888",
	},
	activityPrice: {
		marginTop: 8,
		fontWeight: "600",
		color: "#007AFF",
	},
	timeText: {
		marginTop: 4,
		fontSize: 13,
		color: "#666",
	},
});
