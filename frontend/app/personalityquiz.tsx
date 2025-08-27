import { useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import {
  Card,
  Title,
  RadioButton,
  ProgressBar,
  Text,
} from "react-native-paper";
export default function PersonalityQuiz() {
  const questions = [
    {
      id: 1,
      question: "I enjoy exploring ideas that challenge my exisitng beliefs",
      options: ["Yes", "No"],
    },
    {
      id: 2,
      question: "I prefer familiar routines over trying new approaches",
      options: ["Yes", "No"],
    },

    {
      id: 1,
      question: "I am drawn to art, music or literature that's unconvetional",
      options: ["Yes", "No"],
    },

    {
      id: 1,
      question:
        "I like to think about abstract concepts and philosophical questions",
      options: ["Yes", "No"],
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateOutIn = (nextIndex) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(() => {
      setCurrentQuestion(nextIndex);
      slideAnim.setValue(30);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleAnswer = (value) => {
    const q = questions[currentQuestion];
    const updatedAnswers = { ...answers, [q.id]: value };
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      animateOutIn(currentQuestion + 1);
    } else {
      console.log("quiz complete!", updatedAnswers);
    }
  };

  const q = questions[currentQuestion];
  const progress = (currentQuestion + 1) / questions.length;

  return (
    <>
      <View>
        <Text>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
        <ProgressBar progress={progress} />
      </View>
      <Animated.View>
        <Card>
          <Card.Content>
            <Title>{q.question}</Title>
            <RadioButton.Group onValueChange={(value) => handleAnswer(value)}>
              {q.options.map((opt, index) => (
                <RadioButton.Item key={index} label={opt} value={opt} />
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>
      </Animated.View>
    </>
  );
}
