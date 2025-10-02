import { useState } from 'react';
import { TextInput, Button, HelperText } from "react-native-paper";
import { Text, View, StyleSheet, Alert, ScrollView } from 'react-native';
import loginService from '@/services/loginService';

export default function Signup() {
	const [formData, setFormData] = useState({
		username: '',
		name: '',
		email: '',
		password: '',
		confirmPassword: ''
	});

	const [errors, setErrors] = useState({
		username: '',
		name: '',
		email: '',
		password: '',
		confirmPassword: ''
	});

	const [loading, setLoading] = useState(false);

	const handleChange = (field: keyof typeof formData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors = {
			username: '',
			name: '',
			email: '',
			password: '',
			confirmPassword: ''
		};
		let isValid = true;

		if (!formData.username.trim()) {
			newErrors.username = 'Username is required';
			isValid = false;
		}

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
			isValid = false;
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
			isValid = false;
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Email is invalid';
			isValid = false;
		}

		if (!formData.password) {
			newErrors.password = 'Password is required';
			isValid = false;
		} else if (formData.password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters';
			isValid = false;
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setLoading(true);
		try {
			await loginService.signup({
				username: formData.username,
				name: formData.name,
				email: formData.email,
				password: formData.password
			});

			Alert.alert('Success', 'Account created successfully!');
			// Navigate to home screen or login screen
			// navigation.navigate('Home');
		} catch (error: any) {
			Alert.alert('Error', error.response?.data?.message || 'Failed to create account');
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView>
			<View style={styles.container}>
				<Text style={styles.label}>Username</Text>
				<TextInput
					placeholder="Username"
					value={formData.username}
					onChangeText={(value) => handleChange('username', value)}
					error={!!errors.username}
					disabled={loading}
				/>
				<HelperText type="error" visible={!!errors.username}>
					{errors.username}
				</HelperText>

				<Text style={styles.label}>Name</Text>
				<TextInput
					placeholder="Full Name"
					value={formData.name}
					onChangeText={(value) => handleChange('name', value)}
					error={!!errors.name}
					disabled={loading}
				/>
				<HelperText type="error" visible={!!errors.name}>
					{errors.name}
				</HelperText>

				<Text style={styles.label}>Email</Text>
				<TextInput
					placeholder="Email"
					value={formData.email}
					onChangeText={(value) => handleChange('email', value)}
					keyboardType="email-address"
					autoCapitalize="none"
					error={!!errors.email}
					disabled={loading}
				/>
				<HelperText type="error" visible={!!errors.email}>
					{errors.email}
				</HelperText>

				<Text style={styles.label}>Password</Text>
				<TextInput
					placeholder="Password"
					value={formData.password}
					onChangeText={(value) => handleChange('password', value)}
					secureTextEntry
					error={!!errors.password}
					disabled={loading}
				/>
				<HelperText type="error" visible={!!errors.password}>
					{errors.password}
				</HelperText>

				<Text style={styles.label}>Re-enter Password</Text>
				<TextInput
					placeholder="Re-Enter Password"
					value={formData.confirmPassword}
					onChangeText={(value) => handleChange('confirmPassword', value)}
					secureTextEntry
					error={!!errors.confirmPassword}
					disabled={loading}
				/>
				<HelperText type="error" visible={!!errors.confirmPassword}>
					{errors.confirmPassword}
				</HelperText>

				<Button
					mode="contained"
					onPress={handleSubmit}
					loading={loading}
					disabled={loading}
					style={styles.button}
				>
					Submit
				</Button>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
	},
	label: {
		marginTop: 10,
		marginBottom: 5,
		fontSize: 16,
	},
	button: {
		marginTop: 20,
	}
});
