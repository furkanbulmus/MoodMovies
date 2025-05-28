import { useState, useCallback } from 'react';
import { Movie, MovieRecommendation } from '@/types/movie';
import { MoodVector, MoodPreference } from '@/types/mood';
import { parseMoviesCSV } from '@/lib/csv-parser';
import { MoodAnalyzer } from '@/lib/mood-analyzer';

export function useMovieRecommendations() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    if (movies.length > 0) return; // Already loaded
    
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedMovies = await parseMoviesCSV();
      if (loadedMovies.length === 0) {
        throw new Error('No movies loaded');
      }
      setMovies(loadedMovies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  }, [movies.length]);

  const generateRecommendations = useCallback(async (
    userMoods: MoodVector,
    preference: MoodPreference,
    limit: number = 10
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load movies if not already loaded
      let moviesToUse = movies;
      if (moviesToUse.length === 0) {
        console.log('Loading movies...');
        moviesToUse = await parseMoviesCSV();
        console.log('Movies loaded:', moviesToUse.length);
        
        if (moviesToUse.length === 0) {
          throw new Error('Film verileri yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
        }
        setMovies(moviesToUse);
      }
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Generating recommendations...');
      const recs = MoodAnalyzer.generateRecommendations(
        moviesToUse,
        userMoods,
        preference,
        limit
      );
      console.log('Recommendations generated:', recs.length);

      if (recs.length === 0) {
        throw new Error('Seçtiğiniz ruh haline uygun film bulunamadı. Lütfen farklı ruh halleri seçin veya "Ruh Halimi Değiştir" seçeneğini deneyin.');
      }
      
      setRecommendations(recs);
    } catch (err) {
      console.error('Recommendation error:', err);
      setError(err instanceof Error ? err.message : 'Film önerileri oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  }, [movies]);

  const loadMoreRecommendations = useCallback(async (
    userMoods: MoodVector,
    preference: MoodPreference,
    currentCount: number = 10
  ) => {
    if (movies.length === 0) return;
    
    setIsLoading(true);
    
    try {
      const moreRecs = MoodAnalyzer.generateRecommendations(
        movies,
        userMoods,
        preference,
        currentCount + 10
      );

      if (moreRecs.length === 0) {
        throw new Error('No more recommendations available');
      }
      
      setRecommendations(moreRecs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [movies]);

  return {
    movies,
    recommendations,
    isLoading,
    error,
    loadMovies,
    generateRecommendations,
    loadMoreRecommendations,
  };
}
