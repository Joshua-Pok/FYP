import { Button, Card } from "react-native-paper";

export default function ActiviyCard() {
  return (
    <Card>
      <Card.Title title="Activity Card" subtitle="this is some activity" />
      <Card.Cover source={{ uri: "https://picsum.photos/700" }} />
      <Card.Actions>
        <Button>Cancel</Button>
        <Button>Ok</Button>
      </Card.Actions>
    </Card>
  );
}
