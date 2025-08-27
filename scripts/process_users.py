import pandas as pd
import numpy as np

def process_personality_csv(input_file, output_file):
    # Read the CSV
    df = pd.read_csv(input_file)
    
    # Define Big Five traits and their question indices (0-based)
    big_five_questions = {
        'openness': [0, 1, 2, 3, 4],
        'conscientiousness': [5, 6, 7, 8, 9],  
        'extraversion': [10, 11, 12, 13, 14],
        'agreeableness': [15, 16, 17, 18, 19],
    }
    
    # Questions that need reverse scoring
    reverse_score_questions = {
        'openness': [0, 1],
        'conscientiousness': [],
        'extraversion': [],
        'agreeableness': [],
    }
    
    results = []
    
    for index, row in df.iterrows():
        user_id = f"user_{index + 1:03d}"
        
        # Extract personality scores (first 25 columns after timestamp)
        personality_scores = []
        start_col = 1  # Skip timestamp column
        
        for i in range(start_col, start_col + 20):
            if i < len(row):
                score = int(row.iloc[i]) if pd.notna(row.iloc[i]) else 3
                personality_scores.append(score)
            else:
                personality_scores.append(3)
        
        # Calculate Big Five traits
        traits = {}
        for trait, question_indices in big_five_questions.items():
            trait_scores = []
            
            for q_idx in question_indices:
                if q_idx < len(personality_scores):
                    score = personality_scores[q_idx]  # Get the actual score
                    
                    # Apply reverse scoring if needed
                    if q_idx in reverse_score_questions.get(trait, []):
                        score = 6 - score  # Reverse 1-5 scale
                    
                    trait_scores.append(score)
            
            # Calculate average and normalize
            if trait_scores:
                avg_score = np.mean(trait_scores)
                normalized_score = int(((avg_score - 1) / 4) * 100)
                traits[trait] = max(0, min(100, normalized_score))
        
        # Create labels
        labels = []
        for trait, score in traits.items():
            labels.append(f"{trait}_{score}")
        
        labels_string = ','.join(labels)
        
        results.append({
            'user_id': user_id,
            'labels': labels_string
        })
    
    # Create output DataFrame and save
    output_df = pd.DataFrame(results)
    output_df.to_csv(output_file, index=False, quoting=1)
    
    print(f"Processed {len(results)} users")
    print(f"Output saved to: {output_file}")
    print("\nFirst few rows:")
    print(output_df.head())

if __name__ == "__main__":
    input_file = "survey_data.csv"  # Change this to your file name
    output_file = "gorse_users.csv"
    
    process_personality_csv(input_file, output_file)
