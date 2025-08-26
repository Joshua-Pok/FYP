import { StyleSheet, View } from "react-native";
import { Avatar, Text, Surface } from "react-native-paper";

export default function profilepage() {
  return (
    <>
      <View style={styles.usercard}>
        <Surface style={styles.surface} elevation={4}>
          <Avatar.Icon icon="account"></Avatar.Icon>
          <Text>Username</Text>
        </Surface>
      </View>
      <View>
        <Text>Personality Type: </Text>
        <Text>Country: </Text>
        <Text>Age: </Text>

        <Text>Travel Preferences</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  usercard: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
  },

  surface: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
