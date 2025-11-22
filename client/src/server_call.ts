interface PredictionData {
      Position: string;
      Age: number;
      Appearances: number;
      Shots: number;
      "Shots on target": number;
      "Shooting accuracy %": number;
    }
export const fetchPrediction = async (data: PredictionData) => {
      try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    console.log("Fetch attempt finished.");}
};
