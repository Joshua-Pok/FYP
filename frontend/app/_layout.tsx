import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";
import Navbar from "@/components/Navbar";
export default function RootLayout() {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.content}>
          <Stack>
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="about" options={{ title: "About" }} />
          </Stack>
          <Navbar />
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
