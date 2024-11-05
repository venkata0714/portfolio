import React, { useEffect, useState } from 'react';
import { fetchInvolvements } from '../services/involvementService';

function Involvements() {
  const [involvements, setInvolvements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvolvements = async () => {
      try {
        const data = await fetchInvolvements();
        setInvolvements(data);
      } catch (error) {
        console.error("Failed to load involvements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvolvements();
  }, []);

  if (loading) return <p>Loading involvements...</p>;

  return (
    <div>
      <h2>Involvements</h2>
      <ul>
        {involvements.map((involvement) => (
          <li key={involvement._id}>
            <h3>{involvement.involvementTitle}</h3>
            <p>{involvement.involvementTagline}</p>
            <p><strong>Timeline:</strong> {involvement.involvementTimeline}</p>
            {involvement.involvementParagraphs && involvement.involvementParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {involvement.involvementURLs && involvement.involvementURLs.map((url, index) => (
              <p key={index}><a href={url} target="_blank" rel="noopener noreferrer">Link {index + 1}</a></p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Involvements;
