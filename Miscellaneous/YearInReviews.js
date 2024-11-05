import React, { useEffect, useState } from 'react';
import { fetchYearInReviews } from '../services/yearInReviewService';

function YearInReviews() {
  const [yearInReviews, setYearInReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadYearInReviews = async () => {
      try {
        const data = await fetchYearInReviews();
        setYearInReviews(data);
      } catch (error) {
        console.error("Failed to load Year In Reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    loadYearInReviews();
  }, []);

  if (loading) return <p>Loading Year In Reviews...</p>;

  return (
    <div>
      <h2>Year In Reviews</h2>
      <ul>
        {yearInReviews.map((review) => (
          <li key={review._id}>
            <h3>{review.yearInReviewTitle}</h3>
            <p>{review.yearInReviewTagline}</p>
            <p><strong>Timeline:</strong> {review.yearInReviewTimeline}</p>
            {review.yearInReviewParagraphs && review.yearInReviewParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {review.yearInReviewURLs && review.yearInReviewURLs.map((url, index) => (
              <p key={index}><a href={url} target="_blank" rel="noopener noreferrer">Link {index + 1}</a></p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default YearInReviews;
