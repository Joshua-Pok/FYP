import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import { Button } from "react-native-paper";
import { Calendar, Plus } from "lucide-react-native";
import { api } from "@/services/api";
import { router } from "expo-router";
import { useUser } from "@/context/UserContext";
import ItineraryCard from "@/components/ItineraryCard";

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

	const userId = user!.id;

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
		router.push(`/ViewTripScreen/${id}`);
	};

	const handleCreateItinerary = () => {
		router.push("/CreateItinerary");
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
			<ScrollView contentContainerStyle={styles.emptyContainer}>
				<View style={styles.iconContainer}>
					<Calendar size={48} />
				</View>
				<Text style={styles.emptyTitle}>No itineraries yet</Text>
				<Text style={styles.emptyDescription}>
					Start planning your next adventure by creating your first itinerary.
				</Text>
				<View style={styles.buttonWrapper}>
					<Button
						mode="contained"
						icon={() => <Plus size={16} color="white" />}
						style={styles.newButton}
						onPress={handleCreateItinerary}
						contentStyle={styles.newButtonContent}
						labelStyle={styles.newButtonLabel}
					>
						Create Your First Itinerary
					</Button>
				</View>
			</ScrollView>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<View style={{ flexShrink: 1 }}>
					<Text style={styles.headerTitle}>My Itineraries</Text>
					<Text style={styles.headerSubtitle}>
						Plan and manage your upcoming travel adventures
					</Text>
				</View>
				<Button
					mode="contained"
					icon={() => <Plus size={16} color="white" />}
					style={styles.newButtonHeader}
					contentStyle={styles.newButtonContent}
					labelStyle={styles.newButtonLabel}
					onPress={handleCreateItinerary}
				>
					New Itinerary
				</Button>
			</View>

			<FlatList
				data={itineraries}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContainer}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => handleItinerarySelect(item.id)}>
						<ItineraryCard
							title={item.title}
							description={item.description}
							startDate={item.start_date}
							endDate={item.end_date}
						/>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
	centered: { flex: 1, justifyContent: "center", alignItems: "center" },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderColor: "#ddd",
		backgroundColor: "#fafafa",
	},
	headerTitle: { fontSize: 22, fontWeight: "bold", color: "#222" },
	headerSubtitle: { color: "#666", marginTop: 4, flexShrink: 1 },
	listContainer: { padding: 16 },

	// ✅ Ensures buttons stay visible and centered
	newButton: {
		borderRadius: 8,
		backgroundColor: "#4caf50",
		alignSelf: "center",
		width: "90%",
	},
	newButtonHeader: {
		borderRadius: 8,
		backgroundColor: "#4caf50",
	},
	newButtonContent: {
		paddingVertical: 8,
		paddingHorizontal: 12,
	},
	newButtonLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: "white",
	},

	buttonWrapper: {
		width: "100%",
		alignItems: "center",
	},

	emptyContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 40,
	},
	iconContainer: {
		backgroundColor: "#f2f2f2",
		padding: 16,
		borderRadius: 50,
		marginBottom: 16,
	},
	emptyTitle: { fontSize: 22, fontWeight: "600", marginBottom: 8 },
	emptyDescription: { color: "#777", textAlign: "center", marginBottom: 24 },
});
