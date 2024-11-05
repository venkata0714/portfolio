import React, { useEffect, useState } from 'react';
import { fetchHonorsExperiences } from '../services/honorsExperienceService';

function HonorsExperiences() {
  const [honorsExperiences, setHonorsExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHonorsExperiences = async () => {
      try {
        const data = await fetchHonorsExperiences();
        setHonorsExperiences(data);
      } catch (error) {
        console.error("Failed to load Honors Experiences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHonorsExperiences();
  }, []);

  if (loading) return <p>Loading Honors Experiences...</p>;

  return (
    <div>
      <h2>Honors Experiences</h2>
      <ul>
        {honorsExperiences.map((honor) => (
          <li key={honor._id}>
            <h3>{honor.honorsExperienceTitle}</h3>
            <p>{honor.honorsExperienceTagline}</p>
            <p><strong>Timeline:</strong> {honor.honorsExperienceTimeline}</p>
            {honor.honorsExperienceParagraphs && honor.honorsExperienceParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {honor.honorsExperienceURLs && honor.honorsExperienceURLs.map((url, index) => (
              <p key={index}><a href={url} target="_blank" rel="noopener noreferrer">Link {index + 1}</a></p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HonorsExperiences;
