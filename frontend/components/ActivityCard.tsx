import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface ActivityCardProps {
	title: string;
	price: number;
	address: string;
	country: string;
	image: string;
	initialLiked?: boolean;
	onLikeToggle?: (liked: boolean) => void;
}

export function ActivityCard({
	title,
	price,
	address,
	country,
	image,
	initialLiked = false,
	onLikeToggle,
}: ActivityCardProps) {
	const [isLiked, setIsLiked] = useState(initialLiked);
	const theme = useTheme();

	const handleLikeToggle = () => {
		const newLikedState = !isLiked;
		setIsLiked(newLikedState);
		onLikeToggle?.(newLikedState);
	};

	return (
		<Card style={styles.card} mode="elevated">
			<View style={styles.imageContainer}>
				<Image
					source={{ uri: image || "https://via.placeholder.com/300x200" }}
					style={styles.image}
					resizeMode="cover"
				/>
				<TouchableOpacity
					onPress={handleLikeToggle}
					style={styles.likeButton}
					activeOpacity={0.7}
				>
					<MaterialIcons
						name={isLiked ? "star" : "star-border"}
						size={26}
						color={isLiked ? "#FFC107" : theme.colors.onSurfaceVariant}
					/>
				</TouchableOpacity>
			</View>

			<Card.Content style={styles.content}>
				<Text variant="titleMedium" style={styles.title}>
					{title}
				</Text>
				<View style={styles.addressRow}>
					<MaterialIcons
						name="location-pin"
						size={16}
						color={theme.colors.onSurfaceVariant}
					/>
					<Text variant="bodySmall" numberOfLines={1} style={styles.address}>
						{address}
					</Text>
				</View>

				<View style={styles.footer}>
					<View>
						<Text variant="labelSmall" style={styles.country}>
							{country}
						</Text>
					</View>
					<View style={{ alignItems: "flex-end" }}>
						<Text variant="titleLarge" style={styles.price}>
							${price}
						</Text>
						<Text variant="labelSmall" style={styles.priceNote}>
							per person
						</Text>
					</View>
				</View>
			</Card.Content>
		</Card>
	);
}

const styles = StyleSheet.create({
	card: {
		marginVertical: 10,
		borderRadius: 12,
		overflow: "hidden",
	},
	imageContainer: {
		position: "relative",
		height: 180,
		backgroundColor: "#eee",
	},
	image: {
		width: "100%",
		height: "100%",
	},
	likeButton: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: "rgba(255,255,255,0.8)",
		borderRadius: 20,
		padding: 6,
	},
	content: {
		paddingTop: 10,
	},
	title: {
		fontWeight: "600",
		marginBottom: 6,
	},
	addressRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	address: {
		flex: 1,
		color: "#666",
	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#eee",
		paddingTop: 8,
	},
	country: {
		textTransform: "uppercase",
		color: "#999",
	},
	price: {
		fontWeight: "bold",
	},
	priceNote: {
		color: "#777",
	},
});
