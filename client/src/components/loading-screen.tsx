import { useEffect, useState } from 'react';
import { MoodVector, MoodPreference } from '@/types/mood';
import { useMovieRecommendations } from '@/hooks/use-movie-recommendations';

interface LoadingScreenProps {
  selectedMoods: MoodVector;
  moodPreference: MoodPreference;
  onComplete: () => void;
}

export default function LoadingScreen({ selectedMoods, moodPreference, onComplete }: LoadingScreenProps) {
  const { generateRecommendations, error, recommendations } = useMovieRecommendations();
  const [loadingStep, setLoadingStep] = useState(1);

  useEffect(() => {
    const processRecommendations = async () => {
      try {
        console.log('Starting recommendation generation...');
        setLoadingStep(1);
        await generateRecommendations(selectedMoods, moodPreference);
        console.log('Recommendations generated successfully');
        setLoadingStep(2);
        
        // Kısa bir gecikme ekleyerek kullanıcıya yükleme animasyonunu gösterme
        setTimeout(() => {
          onComplete();
        }, 1000);
      } catch (err) {
        console.error('Failed to generate recommendations:', err);
        onComplete();
      }
    };

    processRecommendations();
  }, [selectedMoods, moodPreference, generateRecommendations, onComplete]);

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Öneriler yüklenemedi</div>
          <p className="text-muted">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="fixed inset-0 bg-netflix-dark bg-opacity-95 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-netflix-red mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold mb-2">
          {loadingStep === 1 ? 'Mükemmel Filmler Bulunuyor' : 'Öneriler Hazırlanıyor'}
        </h3>
        <p className="text-muted">
          {loadingStep === 1 
            ? 'Ruh halinize uygun filmler analiz ediliyor...' 
            : 'Film önerileriniz hazırlanıyor...'}
        </p>
      </div>
    </section>
  );
}
