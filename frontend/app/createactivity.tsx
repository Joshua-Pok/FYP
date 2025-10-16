import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";
import { Button, TextInput, Text } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";

import activityService from "@/services/activityService";
import countryService from "@/services/countryService";

interface Country {
	id: number;
	name: string;
}

export default function CreateActivityScreen() {
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const [address, setAddress] = useState("");
	const [countries, setCountries] = useState<Country[]>([]);
	const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
	const [image, setImage] = useState<{
		uri: string;
		type: string;
		name: string;
	} | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchCountries();
		requestPermissions();
	}, []);

	const requestPermissions = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission needed', 'We need camera roll permissions to upload images');
		}
	};

	const fetchCountries = async () => {
		try {
			const res = await countryService.GetAllCountries();
			setCountries(res);
		} catch (err) {
			console.error("Failed to fetch countries:", err);
			Alert.alert("Error", "Failed to load countries");
		}
	};

	const handleCountrySelect = (countryName: string | undefined) => {
		if (!countryName) return;
		const selected = countries.find((c) => c.name === countryName);
		if (selected) {
			setSelectedCountry(selected);
		}
	};

	const pickImage = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.8,
			});

			if (!result.canceled && result.assets[0]) {
				const asset = result.assets[0];
				const uri = asset.uri;
				const filename = uri.split('/').pop() || 'image.jpg';
				const match = /\.(\w+)$/.exec(filename);
				const type = match ? `image/${match[1]}` : 'image/jpeg';

				setImage({
					uri,
					type,
					name: filename,
				});
			}
		} catch (err) {
			console.error("Error picking image:", err);
			Alert.alert("Error", "Failed to pick image");
		}
	};

	const handleSubmit = async () => {
		// Validation
		if (!name.trim()) {
			Alert.alert("Error", "Please enter activity name");
			return;
		}
		if (!title.trim()) {
			Alert.alert("Error", "Please enter activity title");
			return;
		}
		if (!price || isNaN(Number(price))) {
			Alert.alert("Error", "Please enter a valid price");
			return;
		}
		if (!address.trim()) {
			Alert.alert("Error", "Please enter address");
			return;
		}
		if (!selectedCountry) {
			Alert.alert("Error", "Please select a country");
			return;
		}
		if (!image) {
			Alert.alert("Error", "Please select an image");
			return;
		}

		setLoading(true);
		try {
			await activityService.createActivity({
				name: name,
				title: title,
				price: Number(price),
				address: address,
				countryid: selectedCountry.id,
				image: image,
			});

			Alert.alert("Success", "Activity created successfully!", [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		} catch (err) {
			console.error("Failed to create activity:", err);
			Alert.alert("Error", "Failed to create activity. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text variant="headlineMedium" style={styles.title}>
				Create New Activity
			</Text>

			<TextInput
				label="Activity Name"
				value={name}
				onChangeText={setName}
				mode="outlined"
				style={styles.input}
				placeholder="e.g., Hiking"
			/>

			<TextInput
				label="Title"
				value={title}
				onChangeText={setTitle}
				mode="outlined"
				style={styles.input}
				placeholder="e.g., Mountain Hiking Adventure"
			/>

			<TextInput
				label="Price"
				value={price}
				onChangeText={setPrice}
				mode="outlined"
				keyboardType="numeric"
				style={styles.input}
				placeholder="e.g., 50"
				left={<TextInput.Icon icon="currency-usd" />}
			/>

			<TextInput
				label="Address"
				value={address}
				onChangeText={setAddress}
				mode="outlined"
				multiline
				numberOfLines={2}
				style={styles.input}
				placeholder="e.g., Mount Everest Base Camp"
			/>

			<Dropdown
				label="Country"
				mode="outlined"
				placeholder="Select a country"
				options={countries.map((c) => ({ label: c.name, value: c.name }))}
				value={selectedCountry?.name}
				onSelect={handleCountrySelect}
				style={styles.dropdown}
			/>

			<View style={styles.imageSection}>
				<Text variant="titleMedium" style={styles.sectionTitle}>
					Activity Image
				</Text>

				{image ? (
					<View style={styles.imagePreviewContainer}>
						<Image source={{ uri: image.uri }} style={styles.imagePreview} />
						<Button
							mode="text"
							onPress={pickImage}
							style={styles.changeImageButton}
						>
							Change Image
						</Button>
					</View>
				) : (
					<TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
						<Text style={styles.imagePickerText}>Tap to select image</Text>
					</TouchableOpacity>
				)}
			</View>

			<Button
				mode="contained"
				onPress={handleSubmit}
				disabled={loading}
				loading={loading}
				style={styles.submitButton}
			>
				Create Activity
			</Button>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		paddingBottom: 40,
		backgroundColor: "#fafafa",
	},
	title: {
		textAlign: "center",
		fontWeight: "700",
		marginBottom: 20,
	},
	input: {
		marginBottom: 15,
	},
	dropdown: {
		marginBottom: 15,
	},
	imageSection: {
		marginVertical: 15,
	},
	sectionTitle: {
		fontWeight: "600",
		marginBottom: 10,
	},
	imagePicker: {
		height: 200,
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: "#ccc",
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
	},
	imagePickerText: {
		color: "#666",
		fontSize: 16,
	},
	imagePreviewContainer: {
		alignItems: "center",
	},
	imagePreview: {
		width: "100%",
		height: 200,
		borderRadius: 10,
		resizeMode: "cover",
	},
	changeImageButton: {
		marginTop: 10,
	},
	submitButton: {
		marginTop: 20,
		paddingVertical: 6,
	},
});
