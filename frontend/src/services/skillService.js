import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Fetch all experiences
export const fetchSkills = async () => {
  try {
    const response = await axios.get(`${API_URL}/getskills`);
    return response.data;
  } catch (error) {
    console.error("Error fetching experiences:", error);
    throw error;
  }
};
