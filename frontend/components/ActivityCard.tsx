import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function ActiviyCard() {
const fruits = ["apple", "banana", "cherry"];
    return (
    <Card style={styles.cardwrapper}>
      <Card.Title
        title="Activity Card"
        subtitle="this is some activity"
        titleStyle={styles.title}
        subtitleStyle={styles.location}
      />
      <Card.Cover
        source={{ uri: "https://picsum.photos/700" }}
        style={styles.image}
      />
      <View style={styles.description}>
        <Text>lorem ipsum blah blah blah</Text>
        <Text>Rating: 4/5 Stars</Text>
      </View>
      <Card.Actions>
        <Button>Cancel</Button>
        <Button>Ok</Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardwrapper: {
    width: "100%",
    marginBottom: "5%",
    padding: "2%",
  },

  image: {
    marginBottom: "5%",
  },
  title: {
    fontWeight: "600",
    fontSize: 24,
  },

  location: {
    fontSize: 12,
  },

  description: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
