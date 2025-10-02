import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import axios from "axios";

const questions = [
	{ id: 1, statement: "I enjoy social gatherings." },
	{ id: 2, statement: "I plan ahead and stick to schedules." },
	{ id: 3, statement: "I get stressed easily." },
	{ id: 4, statement: "I like trying new activities." },
	{ id: 5, statement: "I empathize with others easily." },
];

const options = [
	{ label: "Strongly Disagree", value: 1 },
	{ label: "Disagree", value: 2 },
	{ label: "Neutral", value: 3 },
	{ label: "Agree", value: 4 },
	{ label: "Strongly Agree", value: 5 },
];

const api = axios.create({
	baseURL: "http://localhost:8080",
});

export default function QuizScreen({ userId }: { userId: number }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<{ [key: number]: number }>({});
	const [fadeAnim] = useState(new Animated.Value(1));
	const [completed, setCompleted] = useState(false);

	const handleSelect = (value: number) => {
		const currentQuestion = questions[currentIndex];
		const newAnswers = { ...answers, [currentQuestion.id]: value };
		setAnswers(newAnswers);

		// Animate fade out
		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true,
		}).start(() => {
			if (currentIndex + 1 < questions.length) {
				setCurrentIndex(currentIndex + 1);
				fadeAnim.setValue(1); // reset fade for next question
			} else {
				submitPersonality(newAnswers);
				setCompleted(true);
			}
		});
	};

	const submitPersonality = async (answers: { [key: number]: number }) => {
		try {
			// Example: Map your answers to your backend model
			const payload = {
				user_id: userId,
				openness: answers[4] || 3,
				conscientiousness: answers[2] || 3,
				extraversion: answers[1] || 3,
				agreeableness: answers[5] || 3,
				neuroticism: answers[3] || 3,
			};

			const response = await api.post("/personality", payload);
			console.log("Personality submitted:", response.data);
		} catch (err) {
			console.error("Failed to submit personality", err);
		}
	};

	if (completed) {
		return (
			<View style={styles.container}>
				<Text style={styles.questionText}>Quiz Complete!</Text>
				<Text style={styles.progressText}>Thanks for completing the quiz.</Text>
			</View>
		);
	}

	const question = questions[currentIndex];
	const progress = ((currentIndex + 1) / questions.length) * 100;

	return (
		<View style={styles.container}>
			<View style={styles.progressBarBackground}>
				<View style={[styles.progressBarFill, { width: `${progress}%` }]} />
			</View>

			<Animated.View style={{ opacity: fadeAnim, flex: 1, justifyContent: "center" }}>
				<Text style={styles.questionText}>{question.statement}</Text>
				{options.map((opt) => (
					<TouchableOpacity
						key={opt.value}
						style={styles.optionButton}
						onPress={() => handleSelect(opt.value)}
					>
						<Text style={styles.optionText}>{opt.label}</Text>
					</TouchableOpacity>
				))}
				<Text style={styles.progressText}>
					Question {currentIndex + 1} of {questions.length}
				</Text>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#fff",
	},
	progressBarBackground: {
		height: 10,
		width: "100%",
		backgroundColor: "#eee",
		borderRadius: 5,
		marginVertical: 20,
	},
	progressBarFill: {
		height: "100%",
		backgroundColor: "#4caf50",
		borderRadius: 5,
	},
	questionText: {
		fontSize: 22,
		fontWeight: "600",
		marginBottom: 20,
	},
	optionButton: {
		padding: 15,
		marginVertical: 5,
		backgroundColor: "#f0f0f0",
		borderRadius: 10,
	},
	optionText: {
		fontSize: 18,
	},
	progressText: {
		marginTop: 20,
		textAlign: "center",
		fontSize: 16,
		color: "gray",
	},
});
