import Topbar from "@/components/Topbar";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { Button, TextInput } from "react-native-paper";
import loginService from "@/services/loginService";
import { ScrollView } from "react-native-gesture-handler";
export default function LoginScreen() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);


	const handleSubmit = async () => {
		setLoading(true)
		try {
			const result = await loginService.login({ username: username, password: password })
			if (result.success) {
				Alert.alert("You have succesfully logged in!")
			} else {
				Alert.alert("Login Failed, please try again")
			}
			setLoading(false)
		} catch (err) {
			console.error(err)
			setLoading(false)
		}
	}
	return (
		<>
			<Topbar></Topbar>
			<ScrollView>
				<View style={styles.wrapper}>
					<Text style={styles.text}>Username: </Text>
					<TextInput
						label="Username"
						value={username}
						onChangeText={(text) => setUsername(text)}
					></TextInput>
					<Text style={styles.text}>Password: </Text>
					<TextInput
						label="Password"
						value={password}
						onChangeText={(text) => setPassword(text)}
					></TextInput>
				</View>
				<View>
					<Button
						onPress={handleSubmit}
						disabled={loading}
					>Login</Button>
				</View >
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100%",
		justifyContent: "center",
	},

	text: {
		color: "black",
		fontWeight: "600",
		fontSize: 24,
	},
});
