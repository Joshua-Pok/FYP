import ActiviyCard from "@/components/ActivityCard";
import Topbar from "@/components/Topbar";
import { ScrollView, StyleSheet } from "react-native";

export default function Home() {
  return (
    <>
      <Topbar></Topbar>
      <ScrollView style={styles.recommended}>
        <ActiviyCard></ActiviyCard>
        <ActiviyCard></ActiviyCard>
        <ActiviyCard></ActiviyCard>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  recommended: {
    backgroundColor: "grey",
  },
});
