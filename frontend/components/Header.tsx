import { Appbar } from "react-native-paper";
export default function Header() {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Travel Planner" />
        <Appbar.Action icon="dots-vertical" />
      </Appbar.Header>
    </>
  );
}
