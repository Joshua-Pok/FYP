import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import Navbar from "@/components/Navbar";
import ActivityCard from "@/components/ActivityCard";
export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <ActivityCard></ActivityCard>
      <Text variant="headlineMedium">About screen</Text>
      <Button mode="contained">click me</Button>
      <Navbar></Navbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
});
