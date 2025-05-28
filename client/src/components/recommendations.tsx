import { Button } from '@/components/ui/button';
import { useMovieRecommendations } from '@/hooks/use-movie-recommendations';
import { MoodVector, MoodPreference } from '@/types/mood';
import MovieCard from './movie-card';
import { RotateCcw, Share2, Plus } from 'lucide-react';
import { useEffect } from 'react';

interface RecommendationsProps {
  selectedMoods: MoodVector;
  moodPreference: MoodPreference;
  onReset: () => void;
}

export default function Recommendations({ selectedMoods, moodPreference, onReset }: RecommendationsProps) {
  const { recommendations, isLoading, error, loadMoreRecommendations, generateRecommendations } = useMovieRecommendations();

  // Komponent yüklendiğinde önerileri yeniden oluştur
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        await generateRecommendations(selectedMoods, moodPreference);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      }
    };
    loadRecommendations();
  }, [selectedMoods, moodPreference, generateRecommendations]);

  const handleLoadMore = () => {
    loadMoreRecommendations(selectedMoods, moodPreference, recommendations.length);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MoodFlix Önerileri',
          text: 'Ruh halime göre kişiselleştirilmiş film önerilerimi kontrol et!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Paylaşım başarısız:', err);
      }
    } else {
      // Fallback for browsers without Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link panoya kopyalandı!');
      } catch (err) {
        console.log('Kopyalama başarısız:', err);
      }
    }
  };

  const moodNames = Object.keys(selectedMoods).map(mood => 
    mood.charAt(0).toUpperCase() + mood.slice(1)
  ).join(', ');

  const preferenceText = moodPreference === 'match' ? 'ruh halinize uygun' : 'ruh halinizi değiştirecek';

  if (error) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-red-500">Bir şeyler yanlış gitti</h2>
          <p className="text-muted text-lg mb-8">{error}</p>
          <Button onClick={onReset} className="bg-netflix-red hover:bg-red-700">
            <RotateCcw className="mr-2" size={16} />
            Tekrar Dene
          </Button>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0 && !isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Öneri Bulunamadı</h2>
          <p className="text-muted text-lg mb-8">
            Seçtiğiniz kriterlere uygun film bulamadık. Lütfen farklı ruh halleri seçin.
          </p>
          <Button onClick={onReset} className="bg-netflix-red hover:bg-red-700">
            <RotateCcw className="mr-2" size={16} />
            Farklı Ruh Halleri Dene
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Film Önerileriniz</h2>
          <p className="text-muted text-lg mb-6">
            <span className="text-white font-medium">{moodNames}</span> ruh haliniz için {preferenceText} filmler
          </p>
          <div className="flex justify-center items-center space-x-4">
            <Button
              onClick={onReset}
              variant="ghost"
              className="text-netflix-red hover:text-red-400 transition-colors"
            >
              <RotateCcw className="mr-2" size={16} />
              Farklı Ruh Halleri Dene
            </Button>
            <span className="text-gray-500">|</span>
            <Button
              onClick={handleShare}
              variant="ghost"
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <Share2 className="mr-2" size={16} />
              Sonuçları Paylaş
            </Button>
          </div>
        </div>

        {recommendations.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
              {recommendations.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="border-2 border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-200"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2" size={16} />
                    Daha Fazla Film Yükle
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
