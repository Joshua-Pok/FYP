import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import personalityService from "@/services/personalityService";
import { useUser } from "@/context/UserContext";
// 20 carefully chosen questions for the Big Five traits
const questions = [
	{ id: 1, statement: "I enjoy social gatherings.", trait: "extraversion" },
	{ id: 2, statement: "I plan ahead and stick to schedules.", trait: "conscientiousness" },
	{ id: 3, statement: "I get stressed easily.", trait: "neuroticism" },
	{ id: 4, statement: "I like trying new activities and experiences.", trait: "openness" },
	{ id: 5, statement: "I empathize with others easily.", trait: "agreeableness" },
	{ id: 6, statement: "I am talkative and outgoing.", trait: "extraversion" },
	{ id: 7, statement: "I pay attention to details.", trait: "conscientiousness" },
	{ id: 8, statement: "I worry about many things.", trait: "neuroticism" },
	{ id: 9, statement: "I enjoy learning about abstract ideas.", trait: "openness" },
	{ id: 10, statement: "I am helpful and unselfish with others.", trait: "agreeableness" },
	{ id: 11, statement: "I feel comfortable around people.", trait: "extraversion" },
	{ id: 12, statement: "I follow through with my commitments.", trait: "conscientiousness" },
	{ id: 13, statement: "I often feel anxious or tense.", trait: "neuroticism" },
	{ id: 14, statement: "I appreciate art, music, and literature.", trait: "openness" },
	{ id: 15, statement: "I am trusting and cooperative.", trait: "agreeableness" },
	{ id: 16, statement: "I take charge and lead conversations.", trait: "extraversion" },
	{ id: 17, statement: "I am always prepared.", trait: "conscientiousness" },
	{ id: 18, statement: "I get upset easily.", trait: "neuroticism" },
	{ id: 19, statement: "I have a vivid imagination.", trait: "openness" },
	{ id: 20, statement: "I am kind and considerate toward others.", trait: "agreeableness" },
];

const options = [
	{ label: "Strongly Disagree", value: 1 },
	{ label: "Disagree", value: 2 },
	{ label: "Neutral", value: 3 },
	{ label: "Agree", value: 4 },
	{ label: "Strongly Agree", value: 5 },
];


export default function QuizScreen() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<{ [key: number]: number }>({});
	const [fadeAnim] = useState(new Animated.Value(1));
	const [completed, setCompleted] = useState(false);
	const { user } = useUser();
	const userId = user!.id;

	const handleSelect = (value: number) => {
		const currentQuestion = questions[currentIndex];
		const newAnswers = { ...answers, [currentQuestion.id]: value };
		setAnswers(newAnswers);

		Animated.timing(fadeAnim, {
			toValue: 0,
			duration: 200,
			useNativeDriver: true,
		}).start(() => {
			if (currentIndex + 1 < questions.length) {
				setCurrentIndex(currentIndex + 1);
				fadeAnim.setValue(1);
			} else {
				calculateAndSubmitPersonality(newAnswers);
			}
		});
	};

	const calculateAndSubmitPersonality = async (answers: { [key: number]: number }) => {
		// Step 1: Aggregate trait scores
		const traits: Record<string, number[]> = {
			openness: [],
			conscientiousness: [],
			extraversion: [],
			agreeableness: [],
			neuroticism: [],
		};

		questions.forEach((q) => {
			if (answers[q.id] !== undefined) {
				traits[q.trait].push(answers[q.id]);
			}
		});

		// Step 2: Compute averages normalized to 0–1
		const averages: Record<string, number> = {};
		for (const trait in traits) {
			const avg =
				traits[trait].reduce((a, b) => a + b, 0) / traits[trait].length || 3;
			averages[trait] = (avg - 1) / 4; // convert 1–5 scale → 0–1 scale
		}

		// Step 3: Send to backend
		try {
			const payload = {
				user_id: userId,
				openness: averages.openness,
				conscientiousness: averages.conscientiousness,
				extraversion: averages.extraversion,
				agreeableness: averages.agreeableness,
				neuroticism: averages.neuroticism,
			};

			const response = await personalityService.createPersonality(payload);
			console.log("✅ Personality submitted:", response);
			setCompleted(true);
		} catch (err) {
			console.error("❌ Failed to submit personality:", err);
		}
	};

	if (completed) {
		return (
			<View style={styles.container}>
				<Text style={styles.questionText}>Quiz Complete! 🎉</Text>
				<Text style={styles.progressText}>
					Thanks for completing the personality quiz. Your profile has been updated.
				</Text>
			</View>
		);
	}

	const question = questions[currentIndex];
	const progress = ((currentIndex + 1) / questions.length) * 100;

	return (
		<View style={styles.container}>
			{/* Progress Bar */}
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
