import React, { useEffect, useState } from 'react';
import { fetchExperiences } from '../services/experienceService';

function Experiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const data = await fetchExperiences();
        setExperiences(data);
      } catch (error) {
        console.error("Failed to load experiences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExperiences();
  }, []);

  if (loading) return <p>Loading experiences...</p>;

  return (
    <div>
      <h2>Experiences</h2>
      <ul>
        {experiences.map((experience) => (
          <li key={experience._id}>
            <h3>{experience.experienceTitle}</h3>
            <p>{experience.experienceTagline}</p>
            <p><strong>Timeline:</strong> {experience.experienceTimeline}</p>
            {experience.experienceParagraphs && experience.experienceParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {experience.experienceURLs && experience.experienceURLs.map((url, index) => (
              <p key={index}><a href={url} target="_blank" rel="noopener noreferrer">Link {index + 1}</a></p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Experiences;
