import { useState } from "react";
import { TextInput } from "react-native-paper";
export default function Searchbar() {
  const [searchTerm, setSearchTerm] = useState();
  const [text, setText] = useState("");
  return (
    <TextInput
      label="Search for Activities"
      value={searchTerm}
      onChangeText={(text) => setSearchTerm(text)}
    />
  );
}
