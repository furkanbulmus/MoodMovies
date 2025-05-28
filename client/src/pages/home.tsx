import { useState, useEffect } from 'react';
import { Film, Star } from 'lucide-react';
import MoodSelection from '@/components/mood-selection';
import MoodPreference from '@/components/mood-preference';
import LoadingScreen from '@/components/loading-screen';
import Recommendations from '@/components/recommendations';
import { MoodVector, MoodPreference as MoodPref } from '@/types/mood';
import { useMovieRecommendations } from '@/hooks/use-movie-recommendations';
import { Movie } from '@/types/movie';

type Screen = 'welcome' | 'mood-selection' | 'mood-preference' | 'loading' | 'recommendations';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedMoods, setSelectedMoods] = useState<MoodVector>({});
  const [moodPreference, setMoodPreference] = useState<MoodPref>('match');
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const { loadMovies, movies, isLoading } = useMovieRecommendations();

  const handleStartMoodSelection = () => {
    setCurrentScreen('mood-selection');
  };

  const handleMoodSelectionComplete = (moods: MoodVector) => {
    setSelectedMoods(moods);
    setCurrentScreen('mood-preference');
  };

  const handlePreferenceSelected = (preference: MoodPref) => {
    setMoodPreference(preference);
    setCurrentScreen('loading');
  };

  const handleRecommendationsReady = () => {
    setCurrentScreen('recommendations');
  };

  const handleReset = () => {
    setSelectedMoods({});
    setMoodPreference('match');
    setCurrentScreen('welcome');
  };

  // Load movies and set featured movies on component mount
  useEffect(() => {
    const loadFeaturedMovies = async () => {
      await loadMovies();
    };
    loadFeaturedMovies();
  }, [loadMovies]);

  // Set random featured movies when movies are loaded
  useEffect(() => {
    if (movies.length > 0) {
      // Get 16 random movies for carousel
      const shuffledMovies = movies
        .filter(movie => movie.vote_average >= 5.0)
        .sort(() => Math.random() - 0.5)
        .slice(0, 16);
      
      setFeaturedMovies(shuffledMovies);
    }
  }, [movies]);

  return (
    <div className="min-h-screen bg-netflix-dark text-white">
      {/* Header */}
      <header className="bg-netflix-dark/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleReset}
            >
              <Film className="text-netflix-red text-2xl" />
              <h1 className="text-2xl font-bold text-white">MoodFlix</h1>
            </div>
            <div className="text-muted text-sm">
              Discover movies that match your mood
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Screen */}
      {currentScreen === 'welcome' && (
        <section className="py-6 px-4">
          {/* Featured Movies Carousel */}
          {!isLoading && featuredMovies.length > 0 && (
            <div className="container mx-auto max-w-7xl mb-8">
              <div className="relative overflow-hidden">
                <div 
                  className="flex gap-3 animate-scroll"
                  style={{
                    width: `${featuredMovies.length * 150}px`,
                    animation: 'scroll 40s linear infinite'
                  }}
                >
                  {/* First set of movies */}
                  {featuredMovies.map((movie, index) => (
                    <div 
                      key={`${movie.id}-${index}`}
                      className="relative group w-32 flex-shrink-0"
                    >
                      <div className="relative h-48 bg-card-dark rounded-lg overflow-hidden">
                        <img 
                          src={movie.poster_path 
                            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                            : `https://via.placeholder.com/200x300/1f1f1f/ffffff?text=${encodeURIComponent(movie.title)}`
                          }
                          alt={`${movie.title} poster`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/200x300/1f1f1f/ffffff?text=${encodeURIComponent(movie.title)}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                          <div className="text-center">
                            <h3 className="text-white text-xs font-medium line-clamp-2 mb-1">{movie.title}</h3>
                            <div className="flex items-center justify-center">
                              <Star className="text-yellow-400 fill-current mr-1" size={12} />
                              <span className="text-white text-xs font-medium">
                                {movie.vote_average.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {featuredMovies.map((movie, index) => (
                    <div 
                      key={`${movie.id}-${index}-duplicate`}
                      className="relative group w-32 flex-shrink-0"
                    >
                      <div className="relative h-48 bg-card-dark rounded-lg overflow-hidden">
                        <img 
                          src={movie.poster_path 
                            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                            : `https://via.placeholder.com/200x300/1f1f1f/ffffff?text=${encodeURIComponent(movie.title)}`
                          }
                          alt={`${movie.title} poster`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/200x300/1f1f1f/ffffff?text=${encodeURIComponent(movie.title)}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                          <div className="text-center">
                            <h3 className="text-white text-xs font-medium line-clamp-2 mb-1">{movie.title}</h3>
                            <div className="flex items-center justify-center">
                              <Star className="text-yellow-400 fill-current mr-1" size={12} />
                              <span className="text-white text-xs font-medium">
                                {movie.vote_average.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="container mx-auto max-w-6xl text-center mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red mx-auto mb-2"></div>
              <p className="text-muted text-sm">Loading movies...</p>
            </div>
          )}

          {/* Hero Section with prominent mood selection */}
          <div className="container mx-auto max-w-6xl">
            {/* Main CTA Section */}
            <div className="bg-gradient-to-br from-netflix-red/20 to-transparent rounded-2xl p-8 md:p-12 text-center mb-8 border border-netflix-red/30">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                How are you 
                <span className="netflix-red"> feeling</span> 
                right now?
              </h2>
              <p className="text-lg text-muted mb-6 max-w-xl mx-auto">
                Tell us your mood and we'll find the perfect movies for you
              </p>
              
              <button 
                onClick={handleStartMoodSelection}
                className="bg-netflix-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                Start Mood Selection
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Mood Selection Screen */}
      {currentScreen === 'mood-selection' && (
        <MoodSelection
          onComplete={handleMoodSelectionComplete}
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {/* Mood Preference Screen */}
      {currentScreen === 'mood-preference' && (
        <MoodPreference
          selectedMoods={selectedMoods}
          onPreferenceSelected={handlePreferenceSelected}
          onBack={() => setCurrentScreen('mood-selection')}
        />
      )}

      {/* Loading Screen */}
      {currentScreen === 'loading' && (
        <LoadingScreen
          selectedMoods={selectedMoods}
          moodPreference={moodPreference}
          onComplete={handleRecommendationsReady}
        />
      )}

      {/* Recommendations Screen */}
      {currentScreen === 'recommendations' && (
        <Recommendations
          selectedMoods={selectedMoods}
          moodPreference={moodPreference}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
