import { useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Topbar() {
  const [value, setValue] = useState("");

  return (
    <SafeAreaView>
      <SegmentedButtons
        value={value}
        onValueChange={setValue}
        buttons={
          { value: "Popular", label: "Popular" },
          { value: "for-me", label: "For Me" },
          { value: "random", label: "randomassshit" },
        ]}
      ></SegmentedButtons>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
	container: {}
})
