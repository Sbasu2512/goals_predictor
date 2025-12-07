// import React from "react";
import React, { useRef, useState } from "react";
import "./App.css";
import { fetchPrediction } from "./server_call";
import Tooltip from "./components/Tooltip/Tooltip";

interface FormState {
  position: string;
  age: string;
  appearances: string;
  shots: string;
  shotsOnTarget: string;
  [key: string]: string;
}

const fields = [
  {
    label: "Age",
    name: "age",
    tooltipText: "Enter the age of the player",
    min: 0,
  },
  {
    label: "Appearances",
    name: "appearances",
    tooltipText: "Enter number of apprearances the player has made",
    min: 0,
  },
  {
    label: "Shots",
    name: "shots",
    tooltipText: "Enter the number of shots the player has taken",
    min: 0,
  },
  {
    label: "Shots on Target",
    name: "shotsOnTarget",
    tooltipText: "Enter the number of shots on target",
    min: 0,
  },
];

function App() {
  const positionRef = useRef(null);
  const [formData, setFormData] = useState<FormState>({
    position: "",
    age: "",
    appearances: "",
    shots: "",
    shotsOnTarget: "",
  });
  const [prediction, setPrediction] = useState(0);
  const [tooltipRefs] = useState(() =>
    fields.map(() => React.createRef<HTMLLabelElement>())
  );
  const [isError, setIsError] = useState({
    field: "",
    status: false,
  });
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setIsSubmitDisabled(false);
    setIsError({ field: "", status: false });
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateData = (data: FormState) => {
    if (!data.age || (data.age && Number(data.age) < 0)) {
      setIsError({ field: "age", status: true });
      setIsSubmitDisabled(true);
      return true;
    }
    if (
      !data.appearances ||
      (data.appearances && Number(data.appearances) < 0)
    ) {
      setIsError({ field: "appearances", status: true });
      setIsSubmitDisabled(true);
      return true;
    }
    if (!data.shots || (data.shots && Number(data.shots) < 0)) {
      setIsError({ field: "shots", status: true });
      setIsSubmitDisabled(true);
      return true;
    }
    if (
      !data.shotsOnTarget ||
      (data.shotsOnTarget && Number(data.shotsOnTarget) < 0)
    ) {
      setIsError({ field: "shotsOnTarget", status: true });
      setIsSubmitDisabled(true);
      return true;
    }
    if (
      data.shots &&
      data.shotsOnTarget &&
      Number(data.shotsOnTarget) > Number(data.shots)
    ) {
      setIsError({ field: "shotsOnTarget", status: true });
      setIsSubmitDisabled(true);
      return true;
    }
    if (!data.position) {
      setIsError({ field: "position", status: true });
      setIsSubmitDisabled(true);
      return true;
    }

    return false;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const err = validateData(formData);
    if (err) return;
    const formattedData = {
      Position: formData.position,
      Age: Number(formData.age),
      Appearances: Number(formData.appearances),
      Shots: Number(formData.shots),
      "Shots on target": Number(formData.shotsOnTarget),
      "Shooting accuracy %": parseFloat(
        (
          (Number(formData.shotsOnTarget) / Number(formData.shots)) *
          100
        ).toFixed(2)
      ),
    };
    const response = await fetchPrediction(formattedData);
    setPrediction(response?.predicted_goals || 0);
    setFormData({
      position: "",
      age: "",
      appearances: "",
      shots: "",
      shotsOnTarget: "",
    });
  };

  return (
    <div className="container">
      <header>Goal Predictor</header>
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
              <label htmlFor="dropdown" ref={positionRef}>
                Position
              </label>
              <select
                name="position"
                id="dropdown_position"
                value={formData.position}
                onChange={handleInputChange}
                className={
                  isError.status && isError.field === "position"
                    ? "input-error"
                    : ""
                }
              >
                <option value="">Select Position</option>
                <option value="forward">Forward</option>
                <option value="midfielder">Midfielder</option>
                <option value="defender">Defender</option>
                <option value="goalkeeper">GoalKeeper</option>
              </select>
              <Tooltip
                targetRef={positionRef}
                text="Please select a position from the dropdown"
              />
            </div>
            {fields.map((item, index) => (
              <div key={item.name} className="form-group">
                <label htmlFor={`input-${item.name}`} ref={tooltipRefs[index]}>
                  {item.label}
                </label>
                <input
                  type="number"
                  id={`input-${item.name}`}
                  placeholder={`Enter ${item.label} here`}
                  name={item.name}
                  value={formData[item.name]}
                  onChange={handleInputChange}
                  min={item.min}
                  className={
                    isError.status && isError.field === item.name
                      ? "input-error"
                      : ""
                  }
                />

                <Tooltip
                  targetRef={tooltipRefs[index]}
                  text={item.tooltipText}
                />
              </div>
            ))}
          </div>
          <div className="form-group submit-btn">
            <button
              type="submit"
              className={`submit-button ${isSubmitDisabled ? "disabled" : ""}`}
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
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
