import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Image,
	StyleSheet,
	SafeAreaView,
	Modal,
	Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Sample countries
const countries = [
	{ id: 1, name: "Japan" },
	{ id: 2, name: "Thailand" },
	{ id: 3, name: "South Korea" },
	{ id: 4, name: "Singapore" },
	{ id: 5, name: "France" },
];

// Sample available activities
const availableActivities = [
	{
		id: 101,
		name: "Senso-ji Temple",
		title: "Historic Buddhist Temple",
		price: 0,
		address: "2-3-1 Asakusa, Taito City",
		imageurl: "https://images.unsplash.com/photo-1549693578-d683be217e58?w=200",
		country_id: 1,
	},
	{
		id: 102,
		name: "Tsukiji Outer Market",
		title: "Fresh Seafood Market",
		price: 30,
		address: "4 Chome Tsukiji, Chuo City",
		imageurl: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=200",
		country_id: 1,
	},
	{
		id: 103,
		name: "Tokyo Skytree",
		title: "Observation Deck",
		price: 25,
		address: "1 Chome-1-2 Oshiage, Sumida City",
		imageurl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200",
		country_id: 1,
	},
	{
		id: 104,
		name: "Meiji Shrine",
		title: "Peaceful Shinto Shrine",
		price: 0,
		address: "1-1 Yoyogikamizonocho, Shibuya City",
		imageurl: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=200",
		country_id: 1,
	},
	{
		id: 105,
		name: "Shibuya Crossing",
		title: "World's Busiest Intersection",
		price: 0,
		address: "2 Chome-2-1 Dogenzaka, Shibuya City",
		imageurl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=200",
		country_id: 1,
	},
];

const ItineraryBuilder = () => {
	const [step, setStep] = useState(1);
	const [itineraryInfo, setItineraryInfo] = useState({
		title: "",
		description: "",
		countryId: "",
		startDate: new Date(),
		endDate: new Date(),
	});

	const [selectedActivities, setSelectedActivities] = useState([]);
	const [currentDay, setCurrentDay] = useState(1);
	const [errors, setErrors] = useState({});

	// Date picker states
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);

	// Country picker modal
	const [showCountryPicker, setShowCountryPicker] = useState(false);

	// Time picker states
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [timePickerMode, setTimePickerMode] = useState('start');
	const [selectedActivityForTime, setSelectedActivityForTime] = useState(null);

	// Calculate number of days
	const totalDays = Math.ceil(
		(itineraryInfo.endDate - itineraryInfo.startDate) / (1000 * 60 * 60 * 24)
	) + 1;

	useEffect(() => {
		if (currentDay > totalDays && totalDays > 0) {
			setCurrentDay(1);
		}
	}, [totalDays, currentDay]);

	// Filter activities by selected country
	const filteredActivities = itineraryInfo.countryId
		? availableActivities.filter(act => act.country_id === parseInt(itineraryInfo.countryId))
		: availableActivities;

	// Get activities for current day
	const currentDayActivities = selectedActivities
		.filter(act => act.dayNumber === currentDay)
		.sort((a, b) => a.orderInDay - b.orderInDay);

	// Get date for current day
	const getCurrentDate = () => {
		const start = new Date(itineraryInfo.startDate);
		start.setDate(start.getDate() + currentDay - 1);
		return start.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	// Validate step 1
	const validateStep1 = () => {
		const newErrors = {};
		if (!itineraryInfo.title.trim()) newErrors.title = "Title is required";
		if (!itineraryInfo.countryId) newErrors.countryId = "Country is required";
		if (itineraryInfo.endDate < itineraryInfo.startDate) {
			newErrors.endDate = "End date must be after start date";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleContinue = () => {
		if (validateStep1()) {
			setStep(2);
		}
	};

	// Add activity to current day
	const addActivity = (activity) => {
		const maxOrder = Math.max(0, ...currentDayActivities.map(a => a.orderInDay));
		const newActivity = {
			...activity,
			dayNumber: currentDay,
			orderInDay: maxOrder + 1,
			startTime: null,
			endTime: null,
			tempId: Date.now(),
		};
		setSelectedActivities([...selectedActivities, newActivity]);
	};

	// Remove activity
	const removeActivity = (tempId) => {
		setSelectedActivities(selectedActivities.filter(act => act.tempId !== tempId));
	};

	// Update activity time
	const updateActivityTime = (tempId, field, value) => {
		setSelectedActivities(selectedActivities.map(act =>
			act.tempId === tempId ? { ...act, [field]: value } : act
		));
	};

	// Move activity up/down
	const moveActivity = (tempId, direction) => {
		const activityIndex = currentDayActivities.findIndex(a => a.tempId === tempId);
		if (
			(direction === 'up' && activityIndex === 0) ||
			(direction === 'down' && activityIndex === currentDayActivities.length - 1)
		) {
			return;
		}

		const targetIndex = direction === 'up' ? activityIndex - 1 : activityIndex + 1;
		const updatedActivities = [...selectedActivities];

		const currentActivity = updatedActivities.find(a => a.tempId === tempId);
		const targetActivity = currentDayActivities[targetIndex];

		const tempOrder = currentActivity.orderInDay;
		currentActivity.orderInDay = targetActivity.orderInDay;
		targetActivity.orderInDay = tempOrder;

		setSelectedActivities(updatedActivities);
	};

	// Move activity to different day
	const moveToDay = (tempId, newDay) => {
		const activity = selectedActivities.find(a => a.tempId === tempId);
		if (!activity) return;

		const activitiesInNewDay = selectedActivities.filter(a => a.dayNumber === newDay);
		const maxOrder = Math.max(0, ...activitiesInNewDay.map(a => a.orderInDay));

		setSelectedActivities(selectedActivities.map(act =>
			act.tempId === tempId
				? { ...act, dayNumber: newDay, orderInDay: maxOrder + 1 }
				: act
		));
	};

	// Calculate total cost for current day
	const dayTotal = currentDayActivities.reduce((sum, act) => sum + act.price, 0);

	// Submit itinerary
	const handleSubmit = async () => {
		const formattedActivities = selectedActivities.map(act => ({
			activity_id: act.id,
			day_number: act.dayNumber,
			start_time: act.startTime ? act.startTime.toTimeString().slice(0, 5) : null,
			end_time: act.endTime ? act.endTime.toTimeString().slice(0, 5) : null,
			order_in_day: act.orderInDay,
		}));

		const payload = {
			title: itineraryInfo.title,
			description: itineraryInfo.description,
			countryId: itineraryInfo.countryId,
			startDate: itineraryInfo.startDate.toISOString().split('T')[0],
			endDate: itineraryInfo.endDate.toISOString().split('T')[0],
			activities: formattedActivities,
		};

		console.log('Submitting:', payload);
		alert('Itinerary created! Check console for payload.');
	};

	// Open time picker
	const openTimePicker = (tempId, mode) => {
		setSelectedActivityForTime(tempId);
		setTimePickerMode(mode);
		setShowTimePicker(true);
	};

	// Handle time change
	const onTimeChange = (event, selectedTime) => {
		setShowTimePicker(Platform.OS === 'ios');
		if (selectedTime && selectedActivityForTime) {
			const field = timePickerMode === 'start' ? 'startTime' : 'endTime';
			updateActivityTime(selectedActivityForTime, field, selectedTime);
		}
	};

	// Handle date change
	const onDateChange = (event, selectedDate, type) => {
		if (type === 'start') {
			setShowStartDatePicker(Platform.OS === 'ios');
			if (selectedDate) {
				setItineraryInfo({ ...itineraryInfo, startDate: selectedDate });
			}
		} else {
			setShowEndDatePicker(Platform.OS === 'ios');
			if (selectedDate) {
				setItineraryInfo({ ...itineraryInfo, endDate: selectedDate });
			}
		}
	};

	// Step 1: Basic Information
	if (step === 1) {
		return (
			<SafeAreaView style={styles.container}>
				<ScrollView style={styles.scrollView}>
					<View style={styles.header}>
						<Text style={styles.headerTitle}>Create New Itinerary</Text>
						<Text style={styles.headerSubtitle}>Let's start with the basics</Text>
					</View>

					<View style={styles.form}>
						{/* Title */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Itinerary Title *</Text>
							<TextInput
								style={[styles.input, errors.title && styles.inputError]}
								value={itineraryInfo.title}
								onChangeText={(text) => setItineraryInfo({ ...itineraryInfo, title: text })}
								placeholder="e.g., Tokyo Adventure"
								placeholderTextColor="#9CA3AF"
							/>
							{errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
						</View>

						{/* Description */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Description</Text>
							<TextInput
								style={[styles.input, styles.textArea]}
								value={itineraryInfo.description}
								onChangeText={(text) => setItineraryInfo({ ...itineraryInfo, description: text })}
								placeholder="Describe your trip..."
								placeholderTextColor="#9CA3AF"
								multiline
								numberOfLines={4}
							/>
						</View>

						{/* Country */}
						<View style={styles.inputGroup}>
							<Text style={styles.label}>Country *</Text>
							<TouchableOpacity
								style={[styles.input, styles.picker, errors.countryId && styles.inputError]}
								onPress={() => setShowCountryPicker(true)}
							>
								<Text style={itineraryInfo.countryId ? styles.pickerText : styles.placeholderText}>
									{itineraryInfo.countryId
										? countries.find(c => c.id === parseInt(itineraryInfo.countryId))?.name
										: "Select a country"}
								</Text>
							</TouchableOpacity>
							{errors.countryId && <Text style={styles.errorText}>{errors.countryId}</Text>}
						</View>

						{/* Dates */}
						<View style={styles.dateRow}>
							<View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
								<Text style={styles.label}>Start Date *</Text>
								<TouchableOpacity
									style={[styles.input, styles.picker, errors.startDate && styles.inputError]}
									onPress={() => setShowStartDatePicker(true)}
								>
									<Text style={styles.pickerText}>
										{itineraryInfo.startDate.toLocaleDateString()}
									</Text>
								</TouchableOpacity>
								{errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
							</View>

							<View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
								<Text style={styles.label}>End Date *</Text>
								<TouchableOpacity
									style={[styles.input, styles.picker, errors.endDate && styles.inputError]}
									onPress={() => setShowEndDatePicker(true)}
								>
									<Text style={styles.pickerText}>
										{itineraryInfo.endDate.toLocaleDateString()}
									</Text>
								</TouchableOpacity>
								{errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
							</View>
						</View>

						{/* Trip Duration Display */}
						{totalDays > 0 && (
							<View style={styles.durationCard}>
								<Text style={styles.durationText}>
									📅 Trip Duration: {totalDays} {totalDays === 1 ? 'day' : 'days'}
								</Text>
							</View>
						)}

						<TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
							<Text style={styles.primaryButtonText}>Continue to Planning</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>

				{/* Country Picker Modal */}
				<Modal
					visible={showCountryPicker}
					transparent
					animationType="slide"
					onRequestClose={() => setShowCountryPicker(false)}
				>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>Select Country</Text>
							<ScrollView>
								{countries.map(country => (
									<TouchableOpacity
										key={country.id}
										style={styles.modalItem}
										onPress={() => {
											setItineraryInfo({ ...itineraryInfo, countryId: country.id.toString() });
											setShowCountryPicker(false);
										}}
									>
										<Text style={styles.modalItemText}>{country.name}</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
							<TouchableOpacity
								style={styles.modalCloseButton}
								onPress={() => setShowCountryPicker(false)}
							>
								<Text style={styles.modalCloseButtonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>

				{/* Date Pickers */}
				{showStartDatePicker && (
					<DateTimePicker
						value={itineraryInfo.startDate}
						mode="date"
						display="default"
						onChange={(event, date) => onDateChange(event, date, 'start')}
					/>
				)}
				{showEndDatePicker && (
					<DateTimePicker
						value={itineraryInfo.endDate}
						mode="date"
						display="default"
						onChange={(event, date) => onDateChange(event, date, 'end')}
					/>
				)}
			</SafeAreaView>
		);
	}

	// Step 2: Activity Planning
	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.planningHeader}>
				<View>
					<Text style={styles.planningTitle}>{itineraryInfo.title}</Text>
					<Text style={styles.planningSubtitle}>
						📍 {countries.find(c => c.id === parseInt(itineraryInfo.countryId))?.name} • {totalDays} days
					</Text>
				</View>
				<TouchableOpacity onPress={() => setStep(1)}>
					<Text style={styles.editButton}>Edit</Text>
				</TouchableOpacity>
			</View>

			{/* Day Navigation */}
			<View style={styles.dayNavigation}>
				<TouchableOpacity
					onPress={() => setCurrentDay(Math.max(1, currentDay - 1))}
					disabled={currentDay === 1}
					style={[styles.navButton, currentDay === 1 && styles.navButtonDisabled]}
				>
					<Text style={styles.navButtonText}>←</Text>
				</TouchableOpacity>

				<View style={styles.dayInfo}>
					<Text style={styles.dayNumber}>Day {currentDay}</Text>
					<Text style={styles.dayDate}>{getCurrentDate()}</Text>
				</View>

				<TouchableOpacity
					onPress={() => setCurrentDay(Math.min(totalDays, currentDay + 1))}
					disabled={currentDay === totalDays}
					style={[styles.navButton, currentDay === totalDays && styles.navButtonDisabled]}
				>
					<Text style={styles.navButtonText}>→</Text>
				</TouchableOpacity>
			</View>

			{/* Day Tabs */}
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs}>
				{Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
					const dayActivityCount = selectedActivities.filter(a => a.dayNumber === day).length;
					return (
						<TouchableOpacity
							key={day}
							style={[styles.dayTab, currentDay === day && styles.dayTabActive]}
							onPress={() => setCurrentDay(day)}
						>
							<Text style={[styles.dayTabText, currentDay === day && styles.dayTabTextActive]}>
								Day {day}
								{dayActivityCount > 0 && ` (${dayActivityCount})`}
							</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>

			{/* Main Content */}
			<View style={styles.mainContent}>
				{/* Available Activities */}
				<View style={styles.activitiesSection}>
					<Text style={styles.sectionTitle}>Available Activities ({filteredActivities.length})</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{filteredActivities.map(activity => (
							<View key={activity.id} style={styles.activityCard}>
								<Image source={{ uri: activity.imageurl }} style={styles.activityImage} />
								<View style={styles.activityInfo}>
									<Text style={styles.activityName} numberOfLines={1}>{activity.name}</Text>
									<Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
									<View style={styles.activityFooter}>
										<Text style={styles.activityPrice}>${activity.price}</Text>
										<TouchableOpacity
											style={styles.addButton}
											onPress={() => addActivity(activity)}
										>
											<Text style={styles.addButtonText}>+ Add</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						))}
					</ScrollView>
				</View>

				{/* Scheduled Activities */}
				<View style={styles.scheduledSection}>
					<Text style={styles.sectionTitle}>Scheduled for Day {currentDay}</Text>
					<ScrollView style={styles.scheduledList}>
						{currentDayActivities.length === 0 ? (
							<View style={styles.emptyState}>
								<Text style={styles.emptyStateText}>No activities scheduled</Text>
								<Text style={styles.emptyStateSubtext}>Add activities from above</Text>
							</View>
						) : (
							currentDayActivities.map((activity, index) => (
								<View key={activity.tempId} style={styles.scheduledActivity}>
									<Image source={{ uri: activity.imageurl }} style={styles.scheduledImage} />
									<View style={styles.scheduledInfo}>
										<Text style={styles.scheduledName}>{activity.name}</Text>
										<Text style={styles.scheduledTitle}>{activity.title}</Text>

										{/* Time Display/Edit */}
										<View style={styles.timeRow}>
											<TouchableOpacity
												style={styles.timeButton}
												onPress={() => openTimePicker(activity.tempId, 'start')}
											>
												<Text style={styles.timeButtonText}>
													{activity.startTime
														? activity.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
														: 'Start Time'}
												</Text>
											</TouchableOpacity>
											<Text style={styles.timeSeparator}>-</Text>
											<TouchableOpacity
												style={styles.timeButton}
												onPress={() => openTimePicker(activity.tempId, 'end')}
											>
												<Text style={styles.timeButtonText}>
													{activity.endTime
														? activity.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
														: 'End Time'}
												</Text>
											</TouchableOpacity>
										</View>

										<View style={styles.actionsRow}>
											<Text style={styles.activityPrice}>${activity.price}</Text>
											<View style={styles.actionButtons}>
												<TouchableOpacity
													onPress={() => moveActivity(activity.tempId, 'up')}
													disabled={index === 0}
													style={[styles.actionButton, index === 0 && styles.actionButtonDisabled]}
												>
													<Text style={styles.actionButtonText}>↑</Text>
												</TouchableOpacity>
												<TouchableOpacity
													onPress={() => moveActivity(activity.tempId, 'down')}
													disabled={index === currentDayActivities.length - 1}
													style={[styles.actionButton, index === currentDayActivities.length - 1 && styles.actionButtonDisabled]}
												>
													<Text style={styles.actionButtonText}>↓</Text>
												</TouchableOpacity>
												<TouchableOpacity
													onPress={() => removeActivity(activity.tempId)}
													style={[styles.actionButton, styles.deleteButton]}
												>
													<Text style={styles.deleteButtonText}>✕</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</View>
							))
						)}
					</ScrollView>

					{/* Day Summary */}
					{currentDayActivities.length > 0 && (
						<View style={styles.daySummary}>
							<Text style={styles.summaryText}>
								{currentDayActivities.length} {currentDayActivities.length === 1 ? 'activity' : 'activities'}
							</Text>
							<Text style={styles.summaryTotal}>Total: ${dayTotal.toFixed(2)}</Text>
						</View>
					)}
				</View>
			</View>

			{/* Bottom Actions */}
			<View style={styles.bottomActions}>
				<TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
					<Text style={styles.secondaryButtonText}>← Back</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.primaryButton, styles.createButton, selectedActivities.length === 0 && styles.buttonDisabled]}
					onPress={handleSubmit}
					disabled={selectedActivities.length === 0}
				>
					<Text style={styles.primaryButtonText}>Create Itinerary</Text>
				</TouchableOpacity>
			</View>

			{/* Time Picker */}
			{showTimePicker && (
				<DateTimePicker
					value={new Date()}
					mode="time"
					display="default"
					onChange={onTimeChange}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	scrollView: {
		flex: 1,
	},
	header: {
		padding: 24,
		backgroundColor: '#FFFFFF',
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#111827',
		marginBottom: 8,
	},
	headerSubtitle: {
		fontSize: 16,
		color: '#6B7280',
	},
	form: {
		padding: 24,
	},
	inputGroup: {
		marginBottom: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginBottom: 8,
	},
	input: {
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		color: '#111827',
	},
	inputError: {
		borderColor: '#EF4444',
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
	},
	picker: {
		justifyContent: 'center',
	},
	pickerText: {
		fontSize: 16,
		color: '#111827',
	},
	placeholderText: {
		fontSize: 16,
		color: '#9CA3AF',
	},
	errorText: {
		color: '#EF4444',
		fontSize: 12,
		marginTop: 4,
	},
	dateRow: {
		flexDirection: 'row',
	},
	durationCard: {
		backgroundColor: '#DBEAFE',
		borderWidth: 1,
		borderColor: '#93C5FD',
		borderRadius: 8,
		padding: 16,
		marginBottom: 20,
	},
	durationText: {
		color: '#1E40AF',
		fontSize: 16,
		fontWeight: '600',
	},
	primaryButton: {
		backgroundColor: '#3B82F6',
		borderRadius: 8,
		padding: 16,
		alignItems: 'center',
	},
	primaryButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		maxHeight: '80%',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 16,
		color: '#111827',
	},
	modalItem: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	modalItemText: {
		fontSize: 16,
		color: '#111827',
	},
	modalCloseButton: {
		marginTop: 16,
		padding: 16,
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
		alignItems: 'center',
	},
	modalCloseButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#6B7280',
	},
	planningHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	planningTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#111827',
	},
	planningSubtitle: {
		fontSize: 14,
		color: '#6B7280',
		marginTop: 4,
	},
	editButton: {
		color: '#3B82F6',
		fontSize: 14,
		fontWeight: '600',
	},
	dayNavigation: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	navButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#F3F4F6',
		justifyContent: 'center',
		alignItems: 'center',
	},
	navButtonDisabled: {
		opacity: 0.3,
	},
	navButtonText: {
		fontSize: 20,
		color: '#111827',
	},
	dayInfo: {
		alignItems: 'center',
	},
	dayNumber: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#111827',
	},
	dayDate: {
		fontSize: 12,
		color: '#6B7280',
		marginTop: 4,
	},
	dayTab: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: '#F3F4F6',
		marginRight: 8,
	},
	dayTabActive: {
		backgroundColor: '#3B82F6',
	},
	dayTabText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6B7280',
	},
	dayTabTextActive: {
		color: '#FFFFFF',
	},
	mainContent: {
		flex: 1,
	},
	activitiesSection: {
		backgroundColor: '#FFFFFF',
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 12,
		paddingHorizontal: 16,
	},
	activityCard: {
		width: 160,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E5E7EB',
		borderRadius: 8,
		marginLeft: 16,
		overflow: 'hidden',
	},
	activityImage: {
		width: '100%',
		height: 100,
		backgroundColor: '#F3F4F6',
	},
	activityInfo: {
		padding: 12,
	},
	activityName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 4,
	},
	activityTitle: {
		fontSize: 12,
		color: '#6B7280',
		marginBottom: 8,
	},
	activityFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	activityPrice: {
		fontSize: 14,
		fontWeight: '600',
		color: '#10B981',
	},
	addButton: {
		backgroundColor: '#3B82F6',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 4,
	},
	addButtonText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '600',
	},
	scheduledSection: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	scheduledList: {
		flex: 1,
		padding: 16,
	},
	emptyState: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 48,
	},
	emptyStateText: {
		fontSize: 16,
		color: '#9CA3AF',
		marginBottom: 4,
	},
	emptyStateSubtext: {
		fontSize: 14,
		color: '#D1D5DB',
	},
	scheduledActivity: {
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		flexDirection: 'row',
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	scheduledImage: {
		width: 80,
		height: 80,
		borderRadius: 8,
		backgroundColor: '#F3F4F6',
		marginRight: 12,
	},
	scheduledInfo: {
		flex: 1,
	},
	scheduledName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 4,
	},
	scheduledTitle: {
		fontSize: 12,
		color: '#6B7280',
		marginBottom: 8,
	},
	timeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	timeButton: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 4,
		padding: 8,
		alignItems: 'center',
	},
	timeButtonText: {
		fontSize: 12,
		color: '#374151',
	},
	timeSeparator: {
		marginHorizontal: 8,
		color: '#6B7280',
	},
	actionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		width: 32,
		height: 32,
		borderRadius: 4,
		backgroundColor: '#F3F4F6',
		justifyContent: 'center',
		alignItems: 'center',
	},
	actionButtonDisabled: {
		opacity: 0.3,
	},
	actionButtonText: {
		fontSize: 16,
		color: '#111827',
	},
	deleteButton: {
		backgroundColor: '#FEE2E2',
	},
	deleteButtonText: {
		fontSize: 16,
		color: '#EF4444',
	},
	daySummary: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#F3F4F6',
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
	},
	summaryText: {
		fontSize: 14,
		color: '#6B7280',
	},
	summaryTotal: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#10B981',
	},
	bottomActions: {
		flexDirection: 'row',
		padding: 16,
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
		gap: 12,
	},
	secondaryButton: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 8,
		padding: 16,
		alignItems: 'center',
	},
	secondaryButtonText: {
		color: '#374151',
		fontSize: 16,
		fontWeight: '600',
	},
	createButton: {
		flex: 2,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
});

export default ItineraryBuilder; s: {
	backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
			borderBottomColor: '#E5E7EB',
				paddingHorizontal: 16,
					paddingVertical: 12,
  },
dayTab
