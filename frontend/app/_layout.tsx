import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
export default function RootLayout() {
	return (
		<PaperProvider>
			<View style={styles.container}>
				<Header></Header>
				<View style={styles.content}>
					<Stack
						screenOptions={{
							headerShown: false,
						}}
					/>
				</View>
			</View>
			<Navbar />
		</PaperProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "green",
		flex: 1,
		padding: 20
	},
	content: {
		flex: 1,
		padding: "1%",
		backgroundColor: "grey",
	},
});
