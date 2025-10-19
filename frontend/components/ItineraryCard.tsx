import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ItineraryCardProps {
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	onPress?: () => void;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({
	title,
	description,
	startDate,
	endDate,
	onPress,
}) => {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const calculateDuration = (start: string, end: string) => {
		const startDate = new Date(start);
		const endDate = new Date(end);
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	const duration = calculateDuration(startDate, endDate);

	return (
		<TouchableOpacity style={styles.card} onPress={onPress}>
			<View style={styles.content}>
				<View style={styles.header}>
					<View style={{ flex: 1 }}>
						<Text style={styles.title}>{title}</Text>
						<Text style={styles.description} numberOfLines={2}>
							{description}
						</Text>
					</View>
					<View style={styles.badge}>
						<Text style={styles.badgeText}>
							{duration} {duration === 1 ? "day" : "days"}
						</Text>
					</View>
				</View>

				<View style={styles.footer}>
					<View style={styles.dateGroup}>
						<MaterialIcons name="calendar-today" size={18} color="#888" />
						<View style={{ marginLeft: 6 }}>
							<Text style={styles.label}>Start</Text>
							<Text style={styles.date}>{formatDate(startDate)}</Text>
						</View>
					</View>

					<View style={styles.divider} />

					<View style={styles.dateGroup}>
						<MaterialIcons name="calendar-today" size={18} color="#888" />
						<View style={{ marginLeft: 6 }}>
							<Text style={styles.label}>End</Text>
							<Text style={styles.date}>{formatDate(endDate)}</Text>
						</View>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default ItineraryCard;

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		marginVertical: 8,
		marginHorizontal: 16,
		padding: 16,
		elevation: 3,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
	},
	content: {
		flexDirection: "column",
	},
	header: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111",
		marginBottom: 4,
	},
	description: {
		fontSize: 14,
		color: "#666",
	},
	badge: {
		backgroundColor: "#f0f0f0",
		borderRadius: 20,
		paddingVertical: 4,
		paddingHorizontal: 10,
		alignSelf: "flex-start",
	},
	badgeText: {
		fontWeight: "600",
		color: "#333",
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#eee",
		paddingTop: 12,
		justifyContent: "space-between",
	},
	dateGroup: {
		flexDirection: "row",
		alignItems: "center",
	},
	label: {
		fontSize: 10,
		color: "#888",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	date: {
		fontSize: 13,
		fontWeight: "500",
		color: "#111",
	},
	divider: {
		width: 1,
		height: 28,
		backgroundColor: "#ddd",
	},
});
