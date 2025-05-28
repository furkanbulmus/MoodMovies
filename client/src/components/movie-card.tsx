import { MovieRecommendation } from '@/types/movie';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar } from 'lucide-react';

interface MovieCardProps {
  movie: MovieRecommendation;
}

export default function MovieCard({ movie }: MovieCardProps) {
  // Use a placeholder image if poster_path is not available
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : `https://via.placeholder.com/500x750/1f1f1f/ffffff?text=${encodeURIComponent(movie.title)}`;

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
  const matchPercentage = Math.round(movie.similarityScore * 100);

  return (
    <Card className="movie-card bg-card-dark rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 border-gray-700 hover:border-netflix-red group">
      <div className="relative">
        <img 
          src={posterUrl}
          alt={`${movie.title} poster`}
          className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            // Fallback to a generic placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/500x750/1f1f1f/ffffff?text=${encodeURIComponent(movie.title)}`;
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="bg-netflix-red text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
              {matchPercentage}% match
            </div>
            <p className="text-white text-sm">{movie.matchReason}</p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-4 mb-2 text-sm text-muted">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{releaseYear}</span>
          </div>
          
          {movie.vote_average > 0 && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-current" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <p className="text-light text-sm line-clamp-3 mb-3">
          {movie.overview}
        </p>
        
        {movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 3).map((genre) => (
              <span 
                key={genre}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
              >
                {genre}
              </span>
            ))}
            {movie.genres.length > 3 && (
              <span className="text-xs text-gray-500">
                +{movie.genres.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
