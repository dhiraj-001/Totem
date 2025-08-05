import { useState, useEffect } from "react";
import i1 from "../home/assets/i1.png";
import i2 from "../home/assets/i2.png";
import i3 from "../home/assets/i3.png";
import i4 from "../home/assets/i4.png";

// Define the interface for a review
interface Review {
  profileUrl: string;
  name: string;
  description: string;
}

const Testimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('https://totem-consultancy-beta.vercel.app/api/reviews');
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data: Review[] = await response.json();
        setReviews(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="py-12 px-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold font-open-sans leading-[38px] text-gray-800 md:text-5xl md:leading-[56px] mb-20 mt-12">
          Read what others <br />
          <span>have to say</span>
        </h1>
      </div>

      {loading && (
        <div className="text-center">Loading reviews...</div>
      )}

      {error && (
        <div className="text-center text-red-500">Error: {error}</div>
      )}

      <div className="flex flex-wrap justify-center gap-8 mt-12">
        {reviews.map((review, index) => (
          <div key={index} className="relative bg-[#343434] mt-10 p-6 rounded-xl w-full sm:w-[370px] h-[280px]">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <img
                alt={review.name}
                className="w-32 h-32 rounded-full object-cover grayscale"
                src={review.profileUrl}
              />
            </div>
            <div className="mt-16 text-center text-white">
              <h3 className="text-xl font-semibold uppercase">{review.name}</h3>
              <p className="mt-4 text-sm">{review.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center lg:justify-evenly gap-6 mt-32 mb-20">
        <img alt="Image 1" className="h-24 object-cover rounded-lg mt-3" src={i1} />
        <img alt="Image 2" className="w-24 h-24 object-cover rounded-lg mt-3" src={i2} />
        <img alt="Image 3" className="h-24 object-cover rounded-lg mt-3" src={i3} />
        <img alt="Image 4" className="h-24 object-cover rounded-lg mt-3" src={i4} />
      </div>
    </div>
  );
};

export default Testimonials;