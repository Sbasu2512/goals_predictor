import pandas as pd
import numpy as np
import joblib
from flask import Flask, request, jsonify

# 1. Initialize the Flask app
app = Flask(__name__)

# 2. Load the trained model pipeline
# We load this once when the app starts, not on every request
model_pipeline = joblib.load("player_goal_model.joblib")

print("Model loaded successfully")


# 3. Define the API endpoint
@app.route("/predict", methods=["POST"])
def predict():
    """
    Receives player data as JSON and returns a predicted goal count.
    """
    try:
        # 4. Get the JSON data from the API request
        data = request.get_json(force=True)

        # The input data will be a single dictionary
        # We put it into a list to create a single-row DataFrame
        new_player_df = pd.DataFrame([data])

        # 5. !! CRITICAL: Perform the *exact same* feature engineering !!
        # This must match the logic you used for your 'new_player_data'
        # Your pipeline (preprocessor) does *not* do this part for you.

        # Calculate '90s'
        new_player_df["90s"] = new_player_df["Appearances"] * 90

        # Calculate 'Shots_p90' (handle potential division by zero)
        if new_player_df["90s"].iloc[0] > 0:
            new_player_df["Shots_p90"] = (
                new_player_df["Shots"].iloc[0] / new_player_df["Appearances"].iloc[0]
            )
        else:
            new_player_df["Shots_p90"] = 0.0

        # Calculate 'Goals_missed_%' (handle NaNs and division by zero)
        sot = new_player_df["Shots on target"].iloc[0]
        bcm = new_player_df["Shooting accuracy %"].iloc[0]
        ts = new_player_df["Shots"]

        if pd.isna(sot) or pd.isna(bcm) or sot == 0:
            new_player_df["Goals_missed_%"] = np.nan
        else:
            new_player_df["Goals_missed_%"] = ((ts * bcm) / sot) * 100

        # 6. Make the prediction
        # The model_pipeline *will* find the columns it needs,
        # impute NaNs, scale, and pass the data to the model.
        prediction = model_pipeline.predict(new_player_df)

        # 7. Format and return the response
        # prediction is a numpy array, so we take the first element [0]
        return jsonify(
            {"predicted_goals": round(prediction[0], 2), "status": "success"}
        )

    except Exception as e:
        # Handle errors gracefully
        return jsonify({"error": str(e), "status": "error"})


# 8. Run the app
if __name__ == "__main__":
    # '0.0.0.0' makes it accessible on your network, not just localhost
    app.run(host="0.0.0.0", port=5000)
