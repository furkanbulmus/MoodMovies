export interface Movie {
  id: string;
  title: string;
  overview: string;
  genres: string[];
  release_date: string;
  vote_average: number;
  poster_path?: string;
  keywords?: string[];
  runtime?: number;
  moodScore?: number;
  tagline?: string;
  popularity?: number;
  vote_count?: number;
}

export interface MovieRecommendation extends Movie {
  similarityScore: number;
  matchReason: string;
}
