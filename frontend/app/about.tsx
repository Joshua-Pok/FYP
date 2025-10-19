import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "react-native-paper";
import { ActivityCard } from "@/components/ActivityCard"; // ensure this matches your export
import Topbar from "@/components/Topbar";

export default function AboutScreen() {
	const [activities, setActivities] = useState([
		{
			id: "1",
			title: "Tokyo Street Food Tour",
			price: 45,
			address: "Shinjuku, Tokyo, Japan",
			country: "Japan",
			image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
			liked: false,
		},
		{
			id: "2",
			title: "Sunset Kayaking in Bali",
			price: 60,
			address: "Sanur Beach, Bali, Indonesia",
			country: "Indonesia",
			image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
			liked: true,
		},
		{
			id: "3",
			title: "Paris Wine Tasting Tour",
			price: 75,
			address: "Champs-Élysées, Paris, France",
			country: "France",
			image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
			liked: false,
		},
	]);

	const handleLikeToggle = (id: string, liked: boolean) => {
		setActivities((prev) =>
			prev.map((activity) =>
				activity.id === id ? { ...activity, liked } : activity
			)
		);
	};

	return (
		<View style={styles.container}>
			<Topbar />
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				<Text variant="headlineMedium" style={styles.title}>
					Recommended Activities
				</Text>

				{activities.map((activity) => (
					<ActivityCard
						key={activity.id}
						title={activity.title}
						price={activity.price}
						address={activity.address}
						country={activity.country}
						image={activity.image}
						initialLiked={activity.liked}
						onLikeToggle={(liked) => handleLikeToggle(activity.id, liked)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1E1E1E",
	},
	scrollContainer: {
		padding: 16,
		paddingBottom: 40,
	},
	title: {
		color: "#fff",
		textAlign: "center",
		marginBottom: 20,
	},
});
