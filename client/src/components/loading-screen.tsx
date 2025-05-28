import { useEffect } from 'react';
import { MoodVector, MoodPreference } from '@/types/mood';
import { useMovieRecommendations } from '@/hooks/use-movie-recommendations';

interface LoadingScreenProps {
  selectedMoods: MoodVector;
  moodPreference: MoodPreference;
  onComplete: () => void;
}

export default function LoadingScreen({ selectedMoods, moodPreference, onComplete }: LoadingScreenProps) {
  const { generateRecommendations, error } = useMovieRecommendations();

  useEffect(() => {
    const processRecommendations = async () => {
      try {
        await generateRecommendations(selectedMoods, moodPreference);
        onComplete();
      } catch (err) {
        console.error('Failed to generate recommendations:', err);
        // Still proceed to show error state in recommendations
        onComplete();
      }
    };

    processRecommendations();
  }, [selectedMoods, moodPreference, generateRecommendations, onComplete]);

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Failed to load recommendations</div>
          <p className="text-muted">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="fixed inset-0 bg-netflix-dark bg-opacity-95 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-netflix-red mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold mb-2">Finding Perfect Movies</h3>
        <p className="text-muted">Analyzing your mood preferences...</p>
      </div>
    </section>
  );
}
