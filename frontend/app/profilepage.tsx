import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Avatar, Text, Surface, Card, ProgressBar, useTheme, ActivityIndicator } from "react-native-paper";
import { useUser } from "@/context/UserContext";
export default function ProfilePage() {
	const theme = useTheme();
	const { user } = useUser();

	const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(3);

	if (!user) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" />
				<Text>Loading your profile</Text>
			</View>
		)
	}
	return (
		<ScrollView style={styles.container}>
			{/* User Info Section */}
			<Surface style={styles.profileCard} elevation={4}>
				<Avatar.Icon size={80} icon="account" style={styles.avatar} />
				<Text style={styles.username}>{user.name}</Text>
				<Text style={styles.detailText}>Age: {user.email}</Text>
			</Surface>

			{user.personality ? (
				<Card style={styles.card}>
					<Card.Title title="Big Five Personality" titleStyle={styles.cardTitle} />
					<Card.Content>
						{Object.entries(user.personality).map(([trait, value]) => (
							<View key={trait} style={styles.traitContainer}>
								<View style={styles.traitHeader}>
									<Text style={styles.traitLabel}>{capitalize(trait)}</Text>
									<Text style={styles.percent}>{Math.round(value * 100)}%</Text>
								</View>
								<ProgressBar
									progress={value}
									color={theme.colors.primary}
									style={styles.progressBar}
								/>
							</View>
						))}
					</Card.Content>

				</Card>
			) : (
				<Card style={styles.card}>
					<Card.Title
						title="Big Five Personality"
						titleStyle={styles.cardTitle}
					/>
					<Card.Content>
						<Text style={{ color: "gray" }}>
							No personality data available yet.
						</Text>
					</Card.Content>
				</Card>
			)
			}


			{/* Travel Preferences Section */}
			<Card style={styles.card}>
				<Card.Title title="Travel Preferences" titleStyle={styles.cardTitle} />
				<Card.Content>
					<Text style={styles.prefText}>{user.personality.extraversion}</Text>
				</Card.Content>
			</Card>
		</ScrollView >
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F7F8FA",
		padding: 16,
	},
	profileCard: {
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
		borderRadius: 16,
		backgroundColor: "white",
		marginBottom: 20,
	},
	avatar: {
		backgroundColor: "#6200EE",
		marginBottom: 10,
	},
	username: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 4,
	},
	detailText: {
		fontSize: 16,
		color: "gray",
	},
	card: {
		marginBottom: 16,
		borderRadius: 16,
		backgroundColor: "white",
	},
	cardTitle: {
		fontWeight: "600",
		fontSize: 18,
	},
	traitContainer: {
		marginBottom: 14,
	},
	traitHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	traitLabel: {
		fontSize: 16,
		fontWeight: "500",
	},
	percent: {
		fontSize: 16,
		color: "gray",
	},
	progressBar: {
		height: 10,
		borderRadius: 8,
		marginTop: 4,
	},
	prefText: {
		fontSize: 16,
		lineHeight: 22,
		color: "#333",
	},
});
