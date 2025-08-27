import { useState } from "react";
import { BottomNavigation, Text } from "react-native-paper";
export default function Navbar() {
  const HomeRoute = () => <Text>Music</Text>;
  const TripsRoute = () => <Text>Trips</Text>;
  const DummyRoute = () => <Text>Dummy</Text>;
  const ProfileRoute = () => <Text>Profile</Text>;

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

  const renderScene = BottomNavigation.SceneMap({
    home: HomeRoute,
    trips: TripsRoute,
    Dummy: DummyRoute,
    profile: ProfileRoute,
  });
  return (
    <>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      ></BottomNavigation>
    </>
  );
}
