import { useState } from "react";
import "./App.css";
import { fetchPrediction } from "./server_call";

interface FormState {
  position: string;
  age: string;
  appearances: string;
  shots: string;
  shotsontarget: string;
  [key: string]: string;
}

function App() {
  const [formData, setFormData] = useState<FormState>({
    position: "",
    age: "",
    appearances: "",
    shots: "",
    shotsontarget: "",
  });
  const [prediction, setPrediction] = useState(0);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const formattedData = {
      Position: formData.position,
      Age: Number(formData.age),
      Appearances: Number(formData.appearances),
      Shots: Number(formData.shots),
      "Shots on target": Number(formData.shotsontarget),
      "Shooting accuracy %": parseFloat(
        (
          (Number(formData.shotsontarget) / Number(formData.shots)) *
          100
        ).toFixed(2)
      ),
    };
    const response = await fetchPrediction(formattedData);
    // console.log("Data fetched successfully:", response);
    setPrediction(response?.predicted_goals || 0);
    setFormData({
      position: "",
      age: "",
      appearances: "",
      shots: "",
      shotsontarget: "",
    });
  };

  return (
    <div className="container">
      <header>X(G) Prediction</header>
      <div className="container">
        <h3>Overview</h3>
        <p>
          This machine learning system predicts the number of goals a football
          player will score based on their performance statistics, positional
          role, and shooting metrics. The model is trained on real Premier
          League player data and applies feature engineering, preprocessing, and
          multiple ML models to achieve accurate predictions. The evaluation of
          players is based on four key attributes: Age, Appearances, Shots, and
          Shots on Target. Age represents the player’s current age in years,
          while Appearances indicates the total number of matches the player has
          participated in. Shots reflects the number of attempts the player has
          taken toward the goal, and Shots on Target measures how many of these
          attempts were directed accurately at the goal. These parameters
          collectively help analyze a player's performance, consistency, and
          attacking efficiency.
        </p>
      </div>
      <div className="container">
        <form className="form-group">
          <div className="horizontal-layout">
            <div className="form-group">
              <label htmlFor="dropdown">Position</label>
              <select
                name="position"
                id="dropdown_position"
                value={formData.position}
                onChange={handleInputChange}
              >
                <option value="">Select Position</option>
                <option value="forward">Forward</option>
                <option value="midfielder">Midfielder</option>
                <option value="defender">Defender</option>
                <option value="goalkeeper">GoalKeeper</option>
              </select>
            </div>
            {[
              { label: "Age", name: "age" },
              { label: "Appearances", name: "appearances" },
              { label: "Shots", name: "shots" },
              { label: "Shots on Target", name: "shotsOnTarget" },
            ].map((num, _) => (
              <div key={num.name} className="form-group">
                <label htmlFor={`text${num.name}`}>{num.label}</label>
                <input
                  type={_ === 0 ? "text" : "number"}
                  id={`text${num.name.toLowerCase()}`}
                  placeholder={`Enter ${num.label} here`}
                  name={num.name.toLowerCase()}
                  value={formData[num.name.toLowerCase()]}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
          <div className="form-group submit-btn">
            <button
              type="submit"
              className="submit-button"
              onClick={handleSubmit}
            >
              Predict
            </button>
          </div>
        </form>
        <div className="container">
          Based on the provided data, the predicted number of goals is:{" "}
          <strong>{prediction}</strong>
        </div>
      </div>

      <footer>Made by Sayantan Basu</footer>
    </div>
  );
}

export default App;
