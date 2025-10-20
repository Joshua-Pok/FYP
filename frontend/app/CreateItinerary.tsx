import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Image,
	SafeAreaView,
	Modal,
	Platform,
	StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import activityService from '@/services/activityService';
import countryService from '@/services/countryService';
import { useUser } from '@/context/UserContext';
import itineraryService from '@/services/itineraryService';

const ItineraryBuilder = () => {
	const [step, setStep] = useState(1);
	const [itineraryInfo, setItineraryInfo] = useState({
		title: '',
		description: '',
		countryId: '',
		startDate: new Date(),
		endDate: new Date(),
	});
	const [selectedActivities, setSelectedActivities] = useState([]);
	const [currentDay, setCurrentDay] = useState(1);
	const [errors, setErrors] = useState({});
	const [countries, setCountries] = useState([]);
	const [availableActivities, setAvailableActivities] = useState([]);
	const { user } = useUser();

	// Date picker states
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);

	// Country picker modal
	const [showCountryPicker, setShowCountryPicker] = useState(false);

	// Time picker states
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [timePickerMode, setTimePickerMode] = useState('start');
	const [selectedActivityForTime, setSelectedActivityForTime] = useState(null);

	// Load countries on mount
	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const res = await countryService.GetAllCountries();
				setCountries(res); // assuming res is an array of {id, name}
			} catch (err) {
				console.error('Failed to fetch countries', err);
			}
		};
		fetchCountries();
	}, []);

	// Load activities when country changes
	useEffect(() => {
		const fetchActivities = async () => {
			if (!itineraryInfo.countryId) return;
			try {
				const res = await activityService.getActivitiesByCountry(parseInt(itineraryInfo.countryId));
				setAvailableActivities(res);
			} catch (err) {
				console.error('Failed to fetch activities', err);
				setAvailableActivities([]);
			}
		};
		fetchActivities();
	}, [itineraryInfo.countryId]);

	// Calculate number of days
	const totalDays = Math.ceil(
		(itineraryInfo.endDate - itineraryInfo.startDate) / (1000 * 60 * 60 * 24)
	) + 1;

	useEffect(() => {
		if (currentDay > totalDays && totalDays > 0) {
			setCurrentDay(1);
		}
	}, [totalDays, currentDay]);

	// Filter activities by selected country (already fetched dynamically)
	const filteredActivities = availableActivities;

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
			year: 'numeric',
		});
	};

	// Validate step 1
	const validateStep1 = () => {
		const newErrors = {};
		if (!itineraryInfo.title.trim()) newErrors.title = 'Title is required';
		if (!itineraryInfo.countryId) newErrors.countryId = 'Country is required';
		if (itineraryInfo.endDate < itineraryInfo.startDate) {
			newErrors.endDate = 'End date must be after start date';
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleContinue = () => {
		if (validateStep1()) setStep(2);
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
		) return;

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
			user_id: user!.id,
			title: itineraryInfo.title,
			description: itineraryInfo.description,
			start_date: itineraryInfo.startDate.toISOString().split('T')[0],
			end_date: itineraryInfo.endDate.toISOString().split('T')[0],
			activities: formattedActivities,
		};

		const response = await itineraryService.createItinerary(payload);


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

	// -----------------------------
	// Step 1 UI (same as before)
	// Step 2 UI (activities & scheduled list)
	// Only change: use `countries` and `availableActivities` dynamically
	// -----------------------------

	return (
		<SafeAreaView style={styles.container}>
			{step === 1 ? (
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

						{/* Trip Duration */}
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
				</ScrollView>
			) : (
				<ScrollView style={styles.mainContent}>
					{/* Planning Header */}
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
														style={styles.actionButton}
													>
														<Text style={styles.actionButtonText}>✕</Text>
													</TouchableOpacity>
												</View>
											</View>
										</View>
									</View>
								))
							)}
						</ScrollView>

						{/* Day Total */}
						<View style={styles.dayTotal}>
							<Text style={styles.dayTotalText}>Total: ${dayTotal}</Text>
						</View>

						{/* Submit Button */}
						<TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
							<Text style={styles.primaryButtonText}>Submit Itinerary</Text>
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
				</ScrollView>
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
		paddingHorizontal: 16,
	},
	header: {
		marginVertical: 16,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#111827',
	},
	headerSubtitle: {
		fontSize: 16,
		color: '#6B7280',
		marginTop: 4,
	},
	form: {
		marginTop: 8,
	},
	inputGroup: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
		color: '#374151',
		marginBottom: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#FFFFFF',
		color: '#111827',
	},
	inputError: {
		borderColor: '#EF4444',
	},
	errorText: {
		color: '#EF4444',
		fontSize: 12,
		marginTop: 4,
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
	dateRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	durationCard: {
		backgroundColor: '#E0F2FE',
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		alignItems: 'center',
	},
	durationText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#0284C7',
	},
	primaryButton: {
		backgroundColor: '#3B82F6',
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginVertical: 16,
	},
	primaryButtonText: {
		color: '#FFFFFF',
		fontWeight: '600',
		fontSize: 16,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		justifyContent: 'center',
		paddingHorizontal: 32,
	},
	modalContent: {
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		maxHeight: '70%',
		padding: 16,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 12,
		color: '#111827',
	},
	modalItem: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	modalItemText: {
		fontSize: 16,
		color: '#111827',
	},
	modalCloseButton: {
		marginTop: 12,
		paddingVertical: 12,
		alignItems: 'center',
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
	},
	modalCloseButtonText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#374151',
	},
	mainContent: {
		flex: 1,
		paddingHorizontal: 16,
	},
	planningHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: 16,
	},
	planningTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#111827',
	},
	planningSubtitle: {
		fontSize: 14,
		color: '#6B7280',
		marginTop: 2,
	},
	editButton: {
		fontSize: 14,
		fontWeight: '500',
		color: '#3B82F6',
	},
	dayNavigation: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	navButton: {
		padding: 8,
		backgroundColor: '#E5E7EB',
		borderRadius: 8,
	},
	navButtonDisabled: {
		opacity: 0.3,
	},
	navButtonText: {
		fontSize: 18,
		color: '#111827',
	},
	dayInfo: {
		flex: 1,
		alignItems: 'center',
	},
	dayNumber: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
	},
	dayDate: {
		fontSize: 14,
		color: '#6B7280',
	},
	dayTabs: {
		marginBottom: 16,
	},
	dayTab: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
		marginRight: 8,
	},
	dayTabActive: {
		backgroundColor: '#3B82F6',
	},
	dayTabText: {
		fontSize: 14,
		color: '#111827',
		fontWeight: '500',
	},
	dayTabTextActive: {
		color: '#FFFFFF',
	},
	activitiesSection: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
		color: '#111827',
	},
	activityCard: {
		width: 140,
		marginRight: 12,
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
	},
	activityImage: {
		width: '100%',
		height: 90,
	},
	activityInfo: {
		padding: 8,
	},
	activityName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
	},
	activityTitle: {
		fontSize: 12,
		color: '#6B7280',
		marginVertical: 2,
	},
	activityFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 4,
	},
	activityPrice: {
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
	},
	addButton: {
		backgroundColor: '#3B82F6',
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 6,
	},
	addButtonText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '500',
	},
	scheduledSection: {
		marginBottom: 32,
	},
	scheduledList: {
		marginBottom: 12,
	},
	scheduledActivity: {
		flexDirection: 'row',
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		marginBottom: 12,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOpacity: 0.03,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	scheduledImage: {
		width: 80,
		height: 80,
	},
	scheduledInfo: {
		flex: 1,
		padding: 8,
		justifyContent: 'space-between',
	},
	scheduledName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#111827',
	},
	scheduledTitle: {
		fontSize: 12,
		color: '#6B7280',
		marginVertical: 2,
	},
	timeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 4,
	},
	timeButton: {
		flex: 1,
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 6,
		alignItems: 'center',
	},
	timeButtonText: {
		fontSize: 12,
		color: '#111827',
	},
	timeSeparator: {
		marginHorizontal: 4,
		color: '#6B7280',
	},
	actionsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	actionButtons: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	actionButton: {
		padding: 4,
		marginLeft: 4,
		backgroundColor: '#E5E7EB',
		borderRadius: 6,
	},
	actionButtonDisabled: {
		opacity: 0.3,
	},
	actionButtonText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#111827',
	},
	dayTotal: {
		alignItems: 'flex-end',
		marginVertical: 8,
	},
	dayTotalText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
	},
	emptyState: {
		alignItems: 'center',
		paddingVertical: 20,
	},
	emptyStateText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#6B7280',
	},
	emptyStateSubtext: {
		fontSize: 12,
		color: '#9CA3AF',
	},
});


export default ItineraryBuilder;
