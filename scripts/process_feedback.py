import pandas as pd
import numpy as np
from datetime import datetime

def process_feedback_csv(input_file, output_file, activity_columns=range(20,31)):
    try:
        df = pd.read_csv(input_file)
        print(f"Loaded CSV with {len(df)} rows and {len(df.columns)} columns")
    except Exception as e:
        print("Error loading csv")
        return None
    
    activity_cols = list(activity_columns)
    activity_names = [df.columns[i] for i in activity_cols]
    print(f"Processing activities: {activity_names}")
    
    feedback_data = []
    
    for idx, row in df.iterrows():
        user_id = f"user_{str(idx + 1).zfill(3)}"  # user_002, user_003, etc.
        for col_idx, activity_name in zip(activity_cols, activity_names):
            preference = row.iloc[col_idx]
            if str(preference).lower() in ['yes']:
                feedback_type = "star"
                feedback_score = 1.0
            elif str(preference).lower() in ['no']:
                feedback_type = "read"
                feedback_score = 1.0
            else:
                continue
            
            feedback_entry = {
                "FeedbackType": feedback_type,
                "UserId": user_id,
                "ItemId": activity_name.replace(" ", "_").replace("/", "_").lower(),
                "Timestamp": datetime.now().isoformat(),
                "Value": str(feedback_score)
            }
            feedback_data.append(feedback_entry)
    
    # Save as CSV
    output_df = pd.DataFrame(feedback_data)
    output_df.to_csv(output_file, index=False, quoting=1)
    
    print(f"Processed {len(feedback_data)} feedback entries")
    print(f"Output saved to: {output_file}")
    print("\nFirst few rows:")
    print(output_df.head())

if __name__ == "__main__":
    input_file = "survey_data.csv"  
    output_file = "gorse_feedback.csv"
    
    process_feedback_csv(input_file, output_file)
