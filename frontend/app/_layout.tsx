import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import { UserProvider } from "@/context/UserContext";
export default function RootLayout() {
	return (
		<GestureHandlerRootView>
			<UserProvider>
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
			</UserProvider>
		</GestureHandlerRootView>
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
