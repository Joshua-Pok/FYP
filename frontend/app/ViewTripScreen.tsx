import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	Image,
	ScrollView,
	StyleSheet,
	ActivityIndicator,
	TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import activityService from '@/services/activityService'; // Import your service

interface Activity {
	id: number;
	name: string;
	title: string;
	price: number;
	address: string;
	imageurl: string;
	countryid: number;
}

interface Itinerary {
	id: number;
	user_id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	Activities?: Activity[];
}

const ViewTripScreen = () => {
	const params = useLocalSearchParams();
	const itinerary: Itinerary = JSON.parse(params.itineraryData as string);

	const [activities, setActivities] = useState<Activity[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchActivities();
	}, []);

	const fetchActivities = async () => {
		try {
			setLoading(true);
			const data = await activityService.getActivitiesByItinerary(itinerary.id);
			setActivities(data || []);
		} catch (err) {
			setError('Failed to load activities');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const ActivityCard = ({ activity }: { activity: Activity }) => {
		// Fix image URL and construct full URL
		const imageUrl = activity.imageurl.replace('/activities/activities/', '/activities/');
		const fullImageUrl = `http://localhost:9000${imageUrl}`;

		return (
			<View style={styles.activityCard}>
				<Image
					source={{ uri: fullImageUrl }}
					style={styles.activityImage}
					resizeMode="cover"
				/>
				<View style={styles.activityContent}>
					<Text style={styles.activityTitle}>{activity.title}</Text>
					<Text style={styles.activityName}>{activity.name}</Text>
					<Text style={styles.activityAddress}>{activity.address}</Text>
					<View style={styles.priceContainer}>
						<Text style={styles.priceLabel}>Price:</Text>
						<Text style={styles.priceValue}>${activity.price}</Text>
					</View>
				</View>
			</View>
		);
	};

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>Error: {error}</Text>
				<TouchableOpacity style={styles.retryButton} onPress={fetchActivities}>
					<Text style={styles.retryText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<View style={styles.itineraryCard}>
				<View style={styles.itineraryHeader}>
					<Text style={styles.itineraryTitle}>{itinerary.title}</Text>
					<Text style={styles.itineraryDates}>
						{formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
					</Text>
				</View>

				<Text style={styles.itineraryDescription}>
					{itinerary.description}
				</Text>

				<Text style={styles.activitiesHeader}>
					Activities ({activities.length})
				</Text>

				{activities.length > 0 ? (
					activities.map((activity) => (
						<ActivityCard key={activity.id} activity={activity} />
					))
				) : (
					<Text style={styles.noActivities}>No activities added yet</Text>
				)}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	itineraryCard: {
		backgroundColor: 'white',
		margin: 15,
		borderRadius: 12,
		padding: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	itineraryHeader: {
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
		paddingBottom: 10,
		marginBottom: 10,
	},
	itineraryTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	itineraryDates: {
		fontSize: 14,
		color: '#666',
	},
	itineraryDescription: {
		fontSize: 15,
		color: '#444',
		marginBottom: 15,
		lineHeight: 22,
	},
	activitiesHeader: {
		fontSize: 18,
		fontWeight: '600',
		marginTop: 10,
		marginBottom: 10,
	},
	activityCard: {
		flexDirection: 'row',
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		marginBottom: 10,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	activityImage: {
		width: 100,
		height: 100,
	},
	activityContent: {
		flex: 1,
		padding: 12,
		justifyContent: 'space-between',
	},
	activityTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 4,
	},
	activityName: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4,
	},
	activityAddress: {
		fontSize: 13,
		color: '#888',
		marginBottom: 6,
	},
	priceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	priceLabel: {
		fontSize: 14,
		color: '#666',
		marginRight: 5,
	},
	priceValue: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#007AFF',
	},
	noActivities: {
		textAlign: 'center',
		color: '#999',
		fontStyle: 'italic',
		padding: 20,
	},
	errorText: {
		fontSize: 16,
		color: '#ff3b30',
		marginBottom: 15,
	},
	retryButton: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 8,
	},
	retryText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
});

export default ViewTripScreen;
