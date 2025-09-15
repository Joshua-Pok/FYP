import Topbar from "@/components/Topbar";
import { StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { TextInput } from "react-native-paper";
export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <Topbar></Topbar>
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
