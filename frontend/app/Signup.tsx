import { TextInput, Button } from "react-native-paper";
import { Text } from 'react-native'
export default function Signup() {
	return (
		<>
			<Text>Username</Text>
			<TextInput placeholder="Name"></TextInput>
			<Text>Email</Text>
			<TextInput placeholder="Email"></TextInput>
			<Text>Password</Text>
			<TextInput placeholder="Password"></TextInput>
			<Text>Re-enter password</Text>
			<TextInput placeholder="Re-Enter Password"></TextInput>
			<Button>Submit</Button>
		</>
	);
}
