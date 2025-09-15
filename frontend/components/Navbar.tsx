import { useState } from "react";
import { StyleSheet, View } from "react-native";
export default function Navbar() {
  const HomeRoute = () => <View style={styles.content}></View>;
  const TripsRoute = () => <View />;
  const DummyRoute = () => <View />;
  const ProfileRoute = () => <View />;

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: "home",
      title: "Home",
      focusedIcon: "home",
      unfocusedIcon: "home-outline",
    },
    {
      key: "trips",
      title: "Trips",
      focusedIcon: "airplane",
      unfocusedIcon: "airplane",
    },

    {
      key: "Dummy",
      title: "Dummy",
      focusedIcon: "heart",
      unfocusedIcon: "heart-outline",
    },

    {
      key: "profile",
      title: "Profile",
      focusedIcon: "account",
      unfocusedIcon: "account-outline",
    },
  ]);

  return (
    <>
      <BottomNavigation.Bar
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={() => null}
      ></BottomNavigation.Bar>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
