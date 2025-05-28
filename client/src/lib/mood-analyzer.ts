import { Movie, MovieRecommendation } from '@/types/movie';
import { MoodVector, MoodPreference } from '@/types/mood';

// Enhanced mood-to-genre mapping with broader coverage
const MOOD_GENRE_MAP: Record<string, string[]> = {
  happy: ['Comedy', 'Family', 'Animation', 'Adventure', 'Musical', 'Romance'],
  sad: ['Drama', 'Romance', 'History', 'War', 'Biography'],
  fearful: ['Horror', 'Thriller', 'Mystery', 'Crime'],
  angry: ['Action', 'Crime', 'War', 'Thriller', 'Western'],
  inlove: ['Romance', 'Comedy', 'Drama', 'Musical'],
  excited: ['Action', 'Adventure', 'Science Fiction', 'Fantasy', 'Thriller'],
  calm: ['Documentary', 'Drama', 'Family', 'Animation'],
  inspired: ['Biography', 'Documentary', 'Drama', 'Adventure', 'History'],
  bored: ['Action', 'Comedy', 'Adventure', 'Science Fiction', 'Fantasy'],
  hopeful: ['Family', 'Comedy', 'Adventure', 'Fantasy', 'Animation'],
  melancholic: ['Drama', 'Romance', 'Music', 'History'],
  fun: ['Comedy', 'Animation', 'Adventure', 'Family', 'Musical']
};

// Enhanced mood-to-keyword mapping including tags from real dataset
const MOOD_KEYWORD_MAP: Record<string, string[]> = {
  happy: ['joy', 'celebration', 'victory', 'success', 'wedding', 'friendship', 'love', 'fun', 'funny', 'hilarious', 'comedy', 'laugh', 'entertainment', 'party', 'sweet', 'uplifting'],
  sad: ['loss', 'death', 'tragedy', 'separation', 'grief', 'melancholy', 'sorrow', 'depression', 'tears', 'heartbreak', 'sacrifice', 'dramatic', 'emotional'],
  fearful: ['terror', 'horror', 'fear', 'scary', 'nightmare', 'monster', 'ghost', 'danger', 'thriller', 'suspense', 'dark', 'creepy', 'frightening'],
  angry: ['revenge', 'violence', 'fight', 'war', 'conflict', 'rage', 'justice', 'brutal', 'intense', 'aggressive', 'betrayal', 'crime'],
  inlove: ['romance', 'love', 'relationship', 'marriage', 'passion', 'heart', 'romantic', 'dating', 'couple', 'wedding', 'kiss', 'affection'],
  excited: ['adventure', 'action', 'thrill', 'chase', 'excitement', 'adrenaline', 'fast-paced', 'energetic', 'dynamic', 'explosive', 'intense'],
  calm: ['peaceful', 'quiet', 'meditation', 'nature', 'serene', 'tranquil', 'relaxing', 'gentle', 'slow', 'contemplative', 'mindful'],
  inspired: ['dream', 'achievement', 'overcome', 'inspiration', 'motivation', 'hero', 'triumph', 'success', 'courage', 'determination', 'hope'],
  bored: ['escape', 'adventure', 'discovery', 'journey', 'explore', 'exciting', 'thrilling', 'entertaining', 'engaging', 'captivating'],
  hopeful: ['hope', 'future', 'optimism', 'possibility', 'miracle', 'faith', 'positive', 'uplifting', 'encouraging', 'bright'],
  melancholic: ['nostalgia', 'memory', 'past', 'longing', 'bittersweet', 'melancholy', 'wistful', 'reflective', 'somber'],
  fun: ['comedy', 'humor', 'laugh', 'entertainment', 'party', 'celebration', 'playful', 'lighthearted', 'amusing', 'witty', 'clever']
};

export class MoodAnalyzer {
  private static calculateGenreScore(movie: Movie, userMoods: MoodVector): number {
    let score = 0;
    const totalIntensity = Object.values(userMoods).reduce((sum, intensity) => sum + intensity, 0);
    
    if (totalIntensity === 0) return 0;
    
    for (const [mood, intensity] of Object.entries(userMoods)) {
      const weight = intensity / totalIntensity;
      const genresForMood = MOOD_GENRE_MAP[mood] || [];
      
      const genreMatches = movie.genres.filter(genre => 
        genresForMood.some(moodGenre => 
          genre.toLowerCase().includes(moodGenre.toLowerCase()) ||
          moodGenre.toLowerCase().includes(genre.toLowerCase())
        )
      ).length;
      
      score += (genreMatches / Math.max(movie.genres.length, 1)) * weight;
    }
    
    return Math.min(1, score);
  }

  private static calculateKeywordScore(movie: Movie, userMoods: MoodVector): number {
    let score = 0;
    const totalIntensity = Object.values(userMoods).reduce((sum, intensity) => sum + intensity, 0);
    
    if (totalIntensity === 0) return 0;
    
    // Combine overview, tagline, and user tags for analysis
    const textToAnalyze = [
      movie.overview || '',
      movie.tagline || '',
      ...(movie.keywords || [])
    ].join(' ').toLowerCase();
    
    for (const [mood, intensity] of Object.entries(userMoods)) {
      const weight = intensity / totalIntensity;
      const keywordsForMood = MOOD_KEYWORD_MAP[mood] || [];
      
      const keywordMatches = keywordsForMood.filter(keyword => 
        textToAnalyze.includes(keyword.toLowerCase())
      ).length;
      
      if (keywordsForMood.length > 0) {
        score += (keywordMatches / keywordsForMood.length) * weight;
      }
    }
    
    return Math.min(1, score);
  }

  private static calculateTagScore(movie: Movie, userMoods: MoodVector): number {
    let score = 0;
    const totalIntensity = Object.values(userMoods).reduce((sum, intensity) => sum + intensity, 0);
    
    if (totalIntensity === 0 || !movie.keywords || movie.keywords.length === 0) return 0;
    
    const movieTags = movie.keywords.map(tag => tag.toLowerCase());
    
    for (const [mood, intensity] of Object.entries(userMoods)) {
      const weight = intensity / totalIntensity;
      const keywordsForMood = MOOD_KEYWORD_MAP[mood] || [];
      
      const tagMatches = movieTags.filter(tag => 
        keywordsForMood.some(keyword => 
          tag.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(tag)
        )
      ).length;
      
      score += (tagMatches / Math.max(movieTags.length, 1)) * weight;
    }
    
    return Math.min(1, score);
  }

  private static calculateQualityScore(movie: Movie): number {
    // Enhanced quality scoring using multiple factors
    let qualityScore = 0;
    
    // Rating score (0-1)
    const ratingScore = Math.max(0, Math.min(1, (movie.vote_average - 4) / 6));
    qualityScore += ratingScore * 0.4;
    
    // Popularity score (normalized, assuming popularity can be 0-100)
    if (movie.popularity && movie.popularity > 0) {
      const popularityScore = Math.min(1, movie.popularity / 50);
      qualityScore += popularityScore * 0.2;
    }
    
    // Vote count reliability (more votes = more reliable)
    if (movie.vote_count && movie.vote_count > 0) {
      const voteReliability = Math.min(1, movie.vote_count / 1000);
      qualityScore += voteReliability * 0.2;
    }
    
    // Recent movies get slight boost
    if (movie.release_date) {
      const releaseYear = new Date(movie.release_date).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearDiff = currentYear - releaseYear;
      
      if (yearDiff <= 5) {
        qualityScore += 0.1;
      } else if (yearDiff <= 15) {
        qualityScore += 0.05;
      }
    }
    
    // Runtime bonus (avoid too short or too long movies)
    if (movie.runtime && movie.runtime > 80 && movie.runtime < 180) {
      qualityScore += 0.1;
    }
    
    return Math.min(1, qualityScore);
  }

  private static calculateSimilarityScore(
    movie: Movie, 
    userMoods: MoodVector, 
    preference: MoodPreference
  ): number {
    const genreScore = this.calculateGenreScore(movie, userMoods);
    const keywordScore = this.calculateKeywordScore(movie, userMoods);
    const tagScore = this.calculateTagScore(movie, userMoods);
    const qualityScore = this.calculateQualityScore(movie);
    
    // Daha dengeli skor hesaplama
    let moodRelevanceScore = (genreScore * 0.5) + (keywordScore * 0.3) + (tagScore * 0.2);
    
    // Eğer film kalitesi yüksekse, daha fazla ağırlık ver
    if (qualityScore > 0.7) {
      moodRelevanceScore = moodRelevanceScore * 0.7 + 0.3;
    }
    
    // If user wants to change mood, invert the mood relevance but keep quality
    if (preference === 'change') {
      moodRelevanceScore = Math.max(0.1, 1 - moodRelevanceScore);
    }
    
    // Combine mood relevance with quality (weighted)
    const finalScore = (moodRelevanceScore * 0.8) + (qualityScore * 0.2);
    
    return Math.min(1, Math.max(0, finalScore));
  }

  public static generateRecommendations(
    movies: Movie[],
    userMoods: MoodVector,
    preference: MoodPreference,
    limit: number = 10
  ): MovieRecommendation[] {
    if (Object.keys(userMoods).length === 0) {
      return [];
    }

    console.log('Generating recommendations for moods:', userMoods);
    console.log('Total movies to process:', movies.length);

    const scoredMovies = movies.map(movie => {
      const similarityScore = this.calculateSimilarityScore(movie, userMoods, preference);
      const matchReason = this.generateMatchReason(movie, userMoods, preference, similarityScore);
      
      return {
        ...movie,
        similarityScore,
        matchReason
      };
    });

    const filteredMovies = scoredMovies
      .filter(movie => movie.similarityScore > 0.01) // Daha düşük eşik değeri
      .sort((a, b) => {
        // Primary sort by similarity score
        if (Math.abs(a.similarityScore - b.similarityScore) > 0.01) {
          return b.similarityScore - a.similarityScore;
        }
        // Secondary sort by rating
        return b.vote_average - a.vote_average;
      });

    console.log('Filtered movies count:', filteredMovies.length);
    
    return filteredMovies.slice(0, limit);
  }

  private static generateMatchReason(
    movie: Movie,
    userMoods: MoodVector,
    preference: MoodPreference,
    score: number
  ): string {
    const moodEntries = Object.entries(userMoods).sort(([,a], [,b]) => b - a);
    const primaryMood = moodEntries[0]?.[0] || 'current';
    const secondaryMood = moodEntries[1]?.[0];
    
    // Create more specific match reasons based on movie attributes
    const genreScore = this.calculateGenreScore(movie, userMoods);
    const keywordScore = this.calculateKeywordScore(movie, userMoods);
    const qualityScore = this.calculateQualityScore(movie);
    
    if (preference === 'match') {
      if (score > 0.8) {
        if (genreScore > 0.7) return `Perfect ${primaryMood} movie with ideal genres`;
        if (keywordScore > 0.7) return `Exactly matches your ${primaryMood} mood`;
        return `Outstanding fit for your ${primaryMood} feelings`;
      }
      if (score > 0.6) {
        if (secondaryMood && genreScore > 0.5) return `Great blend for ${primaryMood} and ${secondaryMood}`;
        if (qualityScore > 0.7) return `Highly rated ${primaryMood} movie`;
        return `Strong match for your current mood`;
      }
      if (score > 0.4) {
        return `Good fit for your ${primaryMood} vibe`;
      }
      return `Matches some aspects of your mood`;
    } else {
      if (score > 0.8) {
        if (qualityScore > 0.7) return `Top-quality film to shift your perspective`;
        return `Perfect antidote to your ${primaryMood} mood`;
      }
      if (score > 0.6) {
        return `Should help change how you're feeling`;
      }
      if (score > 0.4) {
        return `Might give you a different emotional experience`;
      }
      return `Could offer a mood shift`;
    }
  }

  public static getMoodVector(selectedMoods: Record<string, number>): MoodVector {
    return selectedMoods;
  }
}
