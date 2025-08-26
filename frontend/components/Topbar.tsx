import { useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { SafeAreaView, StyleSheet } from "react-native";

export default function Topbar() {
  const [value, setValue] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        buttons={[
          { value: "Popular", label: "Popular" },
          { value: "for-me", label: "For Me" },
          { value: "random", label: "randomassshit" },
        ]}
      ></SegmentedButtons>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    alignItems: "center",
  },
});
