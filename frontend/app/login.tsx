import Navbar from "@/components/Navbar";
import Topbar from "@/components/Topbar";
import { TextInput } from "react-native-paper";
import { View } from "react-native";
import { useState } from "react";
export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <Topbar></Topbar>
      <View>
        <TextInput
          label="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
        ></TextInput>
        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        ></TextInput>
      </View>
      <Navbar></Navbar>
    </>
  );
}
