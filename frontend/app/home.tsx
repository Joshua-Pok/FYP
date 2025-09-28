import ActiviyCard from "@/components/ActivityCard";
import Topbar from "@/components/Topbar";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function Home() {
	return (
		<>
			<Topbar></Topbar>
			<Text>test</Text>
			<ScrollView style={styles.recommended}>
				<ActiviyCard></ActiviyCard>
				<ActiviyCard></ActiviyCard>
				<ActiviyCard></ActiviyCard>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	recommended: {
		backgroundColor: "grey",
	},
});
