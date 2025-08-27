import { Appbar } from "react-native-paper";
export default function Header() {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="stupidassapp" />
        <Appbar.Action icon="dots-vertical" />
      </Appbar.Header>
    </>
  );
}
