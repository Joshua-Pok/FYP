import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper'
export default function AboutScreen() {
	return (
		<View style={styles.container}>
			<Text variant='headlineMedium'>About screen</Text>
			<Button mode='contained'>click me</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#25292e',
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		color: '#fff',
	},
});


