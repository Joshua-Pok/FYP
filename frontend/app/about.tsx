import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import ActivityCard from "@/components/ActivityCard";
import Topbar from "@/components/Topbar";
export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Topbar></Topbar>
      <ActivityCard></ActivityCard>
      <Text variant="headlineMedium">About screen</Text>
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
