import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
	Button,
	FAB,
	Text,
	Card,
	Chip,
	useTheme,
	Divider,
	TextInput,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { Dropdown } from "react-native-paper-dropdown";
import { router } from "expo-router";

import activityService from "@/services/activityService";
import countryService from "@/services/countryService";
import itineraryService from "@/services/itineraryService";
import { useUser } from "@/context/UserContext";

interface Country {
	id: number;
	name: string;
}

interface Activity {
	id: number;
	name: string;
	title: string;
	price: number;
	address?: string;
	imageurl?: string;
	country_id: number;
}

export default function CreateTrip() {
	const theme = useTheme();
	const { user } = useUser();
	const [countries, setCountries] = useState<Country[]>([]);
	const [country, setCountry] = useState<Country | undefined>();
	const [activities, setActivities] = useState<Activity[]>([]);
	const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
	const [openDatePicker, setOpenDatePicker] = useState(false);
	const [range, setRange] = useState({
		startDate: undefined as Date | undefined,
		endDate: undefined as Date | undefined,
	});
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const fetchCountries = async () => {
		try {
			const res = await countryService.GetAllCountries();
			setCountries(res);
		} catch (err) {
			console.error("Failed to fetch countries:", err);
		}
	};

	const fetchActivitiesByCountry = async (countryId: number) => {
		try {
			const res = await activityService.getActivitiesByCountry(countryId)
			setActivities(res);
			setSelectedActivities([]);
		} catch (err) {
			console.error("Failed to fetch activities:", err);
		}
	};

	useEffect(() => {
		fetchCountries();
	}, []);

	const handleCountrySelect = (countryName: string | undefined) => {
		if (!countryName) return;
		const selected = countries.find((c) => c.name === countryName);
		if (selected) {
			setCountry(selected);
			fetchActivitiesByCountry(selected.id);
		}
	};

	const handleToggleActivity = (activity: Activity) => {
		setSelectedActivities((prev) =>
			prev.find((a) => a.id === activity.id)
				? prev.filter((a) => a.id !== activity.id)
				: [...prev, activity]
		);
	};

	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const handleSubmit = async () => {
		// Validation
		if (!user) {
			Alert.alert("Error", "You must be logged in to create a trip");
			return;
		}

		if (!title.trim()) {
			Alert.alert("Error", "Please enter a trip title");
			return;
		}

		if (!description.trim()) {
			Alert.alert("Error", "Please enter a trip description");
			return;
		}

		if (!range.startDate || !range.endDate) {
			Alert.alert("Error", "Please select trip dates");
			return;
		}

		if (selectedActivities.length === 0) {
			Alert.alert("Error", "Please select at least one activity");
			return;
		}

		setLoading(true);
		try {
			const result = await itineraryService.createItinerary({
				user_id: user.id,
				title: title,
				description: description,
				start_date: formatDate(range.startDate),
				end_date: formatDate(range.endDate),
				activities: selectedActivities.map(a => ({ id: a.id })),
			});

			Alert.alert("Success", "Trip created successfully!", [
				{
					text: "OK",
					onPress: () => {
						// Navigate back or to itineraries list
						router.back();
					},
				},
			]);
		} catch (err) {
			console.error("Failed to create itinerary:", err);
			Alert.alert("Error", "Failed to create trip. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleConfirmDates = ({
		startDate,
		endDate,
	}: {
		startDate: Date | undefined;
		endDate: Date | undefined;
	}) => {
		setRange({ startDate, endDate });
		setOpenDatePicker(false);
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text variant="headlineMedium" style={styles.title}>
				Create Your Trip
			</Text>
			<Text variant="bodyMedium" style={styles.subtitle}>
				Plan your perfect adventure with AI
			</Text>

			{/* Trip Title */}
			<TextInput
				label="Trip Title"
				value={title}
				onChangeText={setTitle}
				mode="outlined"
				style={styles.input}
				placeholder="e.g., Summer Vacation in Paris"
			/>

			{/* Trip Description */}
			<TextInput
				label="Description"
				value={description}
				onChangeText={setDescription}
				mode="outlined"
				multiline
				numberOfLines={3}
				style={styles.input}
				placeholder="Describe your trip..."
			/>

			{/* Country Dropdown */}
			<Dropdown
				label="Country"
				mode="outlined"
				placeholder="Select a country"
				options={countries.map((c) => ({ label: c.name, value: c.name }))}
				value={country?.name}
				onSelect={handleCountrySelect}
				style={styles.dropdown}
			/>

			{/* Activities Selection */}
			{country && (
				<View style={styles.activitiesContainer}>
					<Text variant="titleMedium" style={styles.sectionTitle}>
						Select Activities
					</Text>
					<View style={styles.chipContainer}>
						{activities.map((activity) => (
							<Chip
								key={activity.id}
								selected={selectedActivities.some((a) => a.id === activity.id)}
								onPress={() => handleToggleActivity(activity)}
								style={[
									styles.chip,
									selectedActivities.some((a) => a.id === activity.id) &&
									styles.selectedChip,
								]}
								selectedColor={theme.colors.primary}
							>
								{activity.name}
							</Chip>
						))}
					</View>
				</View>
			)}

			{/* Date Range Picker */}
			<Button
				mode="outlined"
				onPress={() => setOpenDatePicker(true)}
				style={styles.dateButton}
			>
				{range.startDate && range.endDate
					? `${range.startDate.toDateString()} - ${range.endDate.toDateString()}`
					: "Select Trip Dates"}
			</Button>

			<DatePickerModal
				locale="en"
				mode="range"
				visible={openDatePicker}
				onDismiss={() => setOpenDatePicker(false)}
				startDate={range.startDate}
				endDate={range.endDate}
				onConfirm={handleConfirmDates}
			/>

			<Divider style={{ marginVertical: 20 }} />

			{/* Selected Activities Display */}
			<Text variant="titleMedium" style={styles.sectionTitle}>
				Itinerary Preview
			</Text>

			{selectedActivities.length > 0 ? (
				selectedActivities.map((activity) => (
					<Card key={activity.id} style={styles.activityCard}>
						<Card.Title title={activity.name} subtitle={`$${activity.price}`} />
						<Card.Content>
							<Text variant="bodySmall">{activity.title}</Text>
							{activity.address && (
								<Text variant="bodySmall" style={styles.address}>
									📍 {activity.address}
								</Text>
							)}
						</Card.Content>
					</Card>
				))
			) : (
				<Text style={styles.emptyText}>
					Select activities to build your itinerary.
				</Text>
			)}

			{/* Submit Button */}
			<Button
				mode="contained"
				onPress={handleSubmit}
				disabled={loading}
				loading={loading}
				style={styles.submitButton}
			>
				Create Trip
			</Button>

			{/* Floating Action Button */}
			<FAB
				icon="robot"
				label="Generate AI Itinerary"
				onPress={() => console.log("Generate AI itinerary")}
				style={styles.fab}
			/>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingBottom: 100,
		backgroundColor: "#fafafa",
	},
	title: {
		textAlign: "center",
		fontWeight: "700",
		marginBottom: 4,
	},
	subtitle: {
		textAlign: "center",
		color: "#666",
		marginBottom: 20,
	},
	input: {
		marginBottom: 15,
	},
	dropdown: {
		marginBottom: 20,
	},
	activitiesContainer: {
		marginBottom: 20,
	},
	chipContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 10,
	},
	chip: {
		marginRight: 6,
		marginBottom: 6,
	},
	selectedChip: {
		backgroundColor: "#e3f2fd",
	},
	dateButton: {
		marginVertical: 10,
	},
	sectionTitle: {
		fontWeight: "600",
		marginBottom: 10,
	},
	activityCard: {
		marginVertical: 6,
		borderRadius: 10,
		elevation: 2,
	},
	address: {
		marginTop: 4,
		color: "#666",
	},
	emptyText: {
		textAlign: "center",
		color: "#aaa",
		marginVertical: 10,
	},
	submitButton: {
		marginTop: 20,
		marginBottom: 10,
		paddingVertical: 6,
	},
	fab: {
		position: "absolute",
		right: 20,
		bottom: 20,
	},
});
