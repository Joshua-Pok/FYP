import { useState } from "react";
import { StyleSheet } from "react-native"; // Add this import
import { SegmentedButtons } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Topbar() {
	const [value, setValue] = useState("");

	return (
		<SafeAreaView style={styles.container}>
			<SegmentedButtons
				value={value}
				onValueChange={setValue}
				buttons={[
					// This should be an array, not an object
					{ value: "popular", label: "Popular" },
					{ value: "for-me", label: "For Me" },
					{ value: "random", label: "Random" },
				]}
				style={styles.buttons}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'grey',
		padding: 0,
		margin: 0,

		color: 'black'
	},

	buttons: {
		margin: 0,

	}

});
