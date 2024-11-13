import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Fetch all Honors Experiences
export const fetchHonorsExperiences = async () => {
  try {
    const response = await axios.get(`${API_URL}/gethonorsexperiences`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Honors Experiences:", error);
    throw error;
  }
};

// Fetch a specific Honors Experience by honorsExperienceLink
export const fetchHonorsExperienceByLink = async (honorsExperienceLink) => {
  try {
    const response = await axios.get(
      `${API_URL}/gethonorsexperiences/${honorsExperienceLink}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Honors Experience by link:", error);
    throw error;
  }
};
