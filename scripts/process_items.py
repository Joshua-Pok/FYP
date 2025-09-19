import pandas as pd

def process_items_csv(input_file, output_file, activity_columns=range(20,31)):
    try:
        df = pd.read_csv(input_file)
        print(f"Loaded CSV with {len(df)} rows and {len(df.columns)} columns")

    except Exception as e:
        print(f"Error loading csv")
        return None

    activity_cols = list(activity_columns)
    activity_names = [df.columns[i] for i in activity_cols]
    print(f"Found activities: {activity_names}")

    items_data = []

    for activity_name in activity_names:
        item_entry = {
            "ItemId": activity_name.replace(" ", "_").replace("/", "_").lower(),
            "IsHidden": False,
            "Categories": ["activity"],
            "Timestamp": "",
            "Labels": activity_name.replace(" ", "_").replace("/", "_").lower(),
            "Comment": f"Activity: {activity_name}"
       }

        items_data.append(item_entry)

    output_df = pd.DataFrame(items_data)
    output_df.to_csv(output_file, index=False, quoting=1)

    print(f"Created {len(items_data)} item entries")
    print(f"Output saved to {output_file}")

if __name__ in "__main__":
    input_file = "survey_data.csv"
    output_file = "gorse_items.csv"

    process_items_csv(input_file, output_file)

