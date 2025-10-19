import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type FilterType = "popular" | "for-me" | "all";

export default function ActivityTopbar() {
	const [activeFilter, setActiveFilter] = useState<FilterType>("all");

	const handleFilterClick = (filter: FilterType) => {
		// only update state for now — no callback
		setActiveFilter(filter);
	};

	return (
		<View style={styles.container}>
			<View style={styles.filterContainer}>
				<TouchableOpacity
					onPress={() => handleFilterClick("popular")}
					style={[
						styles.button,
						activeFilter === "popular" && styles.activeButton,
					]}
				>
					<Text
						style={[
							styles.buttonText,
							activeFilter === "popular" && styles.activeText,
						]}
					>
						Popular
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => handleFilterClick("for-me")}
					style={[
						styles.button,
						activeFilter === "for-me" && styles.activeButton,
					]}
				>
					<Text
						style={[
							styles.buttonText,
							activeFilter === "for-me" && styles.activeText,
						]}
					>
						For Me
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					onPress={() => handleFilterClick("all")}
					style={[
						styles.button,
						activeFilter === "all" && styles.activeButton,
					]}
				>
					<Text
						style={[
							styles.buttonText,
							activeFilter === "all" && styles.activeText,
						]}
					>
						All Activities
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		marginVertical: 16,
	},
	filterContainer: {
		flexDirection: "row",
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 50,
		padding: 4,
	},
	button: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 50,
		backgroundColor: "transparent",
	},
	buttonText: {
		color: "#aaa",
		fontWeight: "500",
		fontSize: 14,
	},
	activeButton: {
		backgroundColor: "#6200EE", // replace with your theme’s color
		shadowColor: "#6200EE",
		shadowOpacity: 0.3,
		shadowRadius: 5,
		shadowOffset: { width: 0, height: 2 },
	},
	activeText: {
		color: "#fff",
	},
});
