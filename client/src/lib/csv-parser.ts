import Papa from 'papaparse';
import { Movie } from '@/types/movie';

export interface CSVMovie {
  adult: string;
  belongs_to_collection: string;
  budget: string;
  genres: string;
  homepage: string;
  id: string;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: string;
  poster_path: string;
  production_companies: string;
  production_countries: string;
  release_date: string;
  revenue: string;
  runtime: string;
  spoken_languages: string;
  status: string;
  tagline: string;
  title: string;
  video: string;
  vote_average: string;
  vote_count: string;
}

export interface CSVTag {
  userId: string;
  movieId: string;
  tag: string;
  timestamp: string;
}

export interface CSVRating {
  userId: string;
  movieId: string;
  rating: string;
  timestamp: string;
}

// Cache for performance
let moviesCache: Movie[] | null = null;
let tagsCache: Map<string, string[]> | null = null;
let ratingsCache: Map<string, number[]> | null = null;

export async function parseMoviesCSV(csvPath: string = '/movies_metadata.csv'): Promise<Movie[]> {
  if (moviesCache) {
    console.log('Using cached movies:', moviesCache.length);
    return moviesCache;
  }

  try {
    console.log('Fetching movies from:', csvPath);
    const response = await fetch(csvPath);
    if (!response.ok) {
      console.error('Movies CSV fetch failed:', response.status, response.statusText);
      return [];
    }
    
    const csvText = await response.text();
    console.log('CSV text loaded, length:', csvText.length);
    
    return new Promise((resolve, reject) => {
      Papa.parse<CSVMovie>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log('CSV parsed, rows:', results.data.length);
            
            // Load tags and ratings for enhanced recommendations
            const [tags, ratings] = await Promise.all([
              parseTagsCSV().catch(err => {
                console.warn('Tags loading failed:', err);
                return new Map();
              }),
              parseRatingsCSV().catch(err => {
                console.warn('Ratings loading failed:', err);
                return new Map();
              })
            ]);

            console.log('Tags loaded:', tags.size);
            console.log('Ratings loaded:', ratings.size);

            const movies: Movie[] = results.data
              .filter(row => row.title && row.genres)
              .map(row => {
                const movieId = row.id;
                const movieTags = tags.get(movieId) || [];
                const movieRatings = ratings.get(movieId) || [];
                const avgRating = movieRatings.length > 0 
                  ? movieRatings.reduce((sum: number, rating: number) => sum + rating, 0) / movieRatings.length 
                  : parseFloat(row.vote_average) || 0;

                // Clean and validate poster path
                let posterPath: string | undefined = row.poster_path;
                if (posterPath) {
                  // Remove any leading/trailing whitespace
                  posterPath = posterPath.trim();
                  // Remove any leading slashes
                  posterPath = posterPath.replace(/^\/+/, '');
                  // If path doesn't start with a valid TMDB path format, set to undefined
                  if (!posterPath.match(/^[a-zA-Z0-9\/_-]+\.(jpg|jpeg|png)$/i)) {
                    posterPath = undefined;
                  }
                }

                return {
                  id: movieId,
                  title: row.title.trim(),
                  overview: (row.overview || '').trim(),
                  genres: parseGenres(row.genres),
                  release_date: row.release_date || '',
                  vote_average: avgRating,
                  poster_path: posterPath,
                  keywords: movieTags,
                  runtime: row.runtime ? parseFloat(row.runtime) : undefined,
                  tagline: row.tagline || '',
                  popularity: parseFloat(row.popularity) || 0,
                  vote_count: parseInt(row.vote_count) || 0
                };
              })
              .filter(movie => 
                movie.title.length > 0 && 
                movie.genres.length > 0 &&
                movie.vote_average >= 5.0 // Only include movies with decent ratings
              )
              .slice(0, 10000); // Increase the limit to 10000 movies
            
            console.log('Final movies array:', movies.length);
            console.log('Movies with posters:', movies.filter(m => m.poster_path).length);
            moviesCache = movies;
            resolve(movies);
          } catch (error: any) {
            console.error('Error processing movie data:', error);
            resolve([]);
          }
        },
        error: (error: any) => {
          console.error('CSV parsing error:', error);
          resolve([]);
        }
      });
    });
  } catch (error: any) {
    console.error('Failed to load movies data:', error);
    return [];
  }
}

async function parseTagsCSV(): Promise<Map<string, string[]>> {
  if (tagsCache) {
    return tagsCache;
  }

  try {
    const response = await fetch('/tags.csv');
    if (!response.ok) {
      console.warn('Tags CSV not found, proceeding without tags');
      tagsCache = new Map();
      return tagsCache;
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse<CSVTag>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const tagMap = new Map<string, string[]>();
          
          results.data.forEach(row => {
            if (row.movieId && row.tag) {
              const movieId = row.movieId;
              const tag = row.tag.toLowerCase().trim();
              
              if (!tagMap.has(movieId)) {
                tagMap.set(movieId, []);
              }
              tagMap.get(movieId)!.push(tag);
            }
          });

          tagsCache = tagMap;
          resolve(tagMap);
        }
      });
    });
  } catch (error: any) {
    console.warn('Failed to load tags, proceeding without them');
    tagsCache = new Map();
    return tagsCache;
  }
}

async function parseRatingsCSV(): Promise<Map<string, number[]>> {
  if (ratingsCache) {
    return ratingsCache;
  }

  try {
    const response = await fetch('/ratings.csv');
    if (!response.ok) {
      console.warn('Ratings CSV not found, proceeding without ratings');
      ratingsCache = new Map();
      return ratingsCache;
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse<CSVRating>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const ratingMap = new Map<string, number[]>();
          
          // Take only a sample of ratings for performance
          const sampleSize = Math.min(results.data.length, 50000);
          const sampleData = results.data.slice(0, sampleSize);
          
          sampleData.forEach(row => {
            if (row.movieId && row.rating) {
              const movieId = row.movieId;
              const rating = parseFloat(row.rating);
              
              if (!isNaN(rating)) {
                if (!ratingMap.has(movieId)) {
                  ratingMap.set(movieId, []);
                }
                ratingMap.get(movieId)!.push(rating);
              }
            }
          });

          ratingsCache = ratingMap;
          resolve(ratingMap);
        }
      });
    });
  } catch (error) {
    console.warn('Failed to load ratings, proceeding without them');
    ratingsCache = new Map();
    return ratingsCache;
  }
}

function parseGenres(genresString: string): string[] {
  if (!genresString) return [];
  
  try {
    // Handle both JSON format and simple comma-separated format
    if (genresString.startsWith('[')) {
      const parsed = JSON.parse(genresString);
      return Array.isArray(parsed) 
        ? parsed.map(g => typeof g === 'object' ? g.name : g).filter(Boolean)
        : [];
    } else {
      return genresString.split(',').map(g => g.trim()).filter(Boolean);
    }
  } catch {
    return genresString.split(',').map(g => g.trim()).filter(Boolean);
  }
}

function parseKeywords(keywordsString?: string): string[] {
  if (!keywordsString) return [];
  
  try {
    if (keywordsString.startsWith('[')) {
      const parsed = JSON.parse(keywordsString);
      return Array.isArray(parsed) 
        ? parsed.map(k => typeof k === 'object' ? k.name : k).filter(Boolean)
        : [];
    } else {
      return keywordsString.split(',').map(k => k.trim()).filter(Boolean);
    }
  } catch {
    return keywordsString.split(',').map(k => k.trim()).filter(Boolean);
  }
}
