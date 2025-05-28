export interface Mood {
  id: string;
  name: string;
  icon: string;
  color: string;
  intensity: number;
}

export interface MoodVector {
  [key: string]: number;
}

export type MoodPreference = 'match' | 'change';

export const MOODS = [
  { id: 'happy', name: 'Happy', icon: 'smile', color: 'text-amber-400' },
  { id: 'sad', name: 'Sad', icon: 'frown', color: 'text-blue-400' },
  { id: 'fearful', name: 'Fearful', icon: 'exclamation-triangle', color: 'text-orange-400' },
  { id: 'angry', name: 'Angry', icon: 'angry', color: 'text-red-400' },
  { id: 'inlove', name: 'In Love', icon: 'heart', color: 'text-pink-400' },
  { id: 'excited', name: 'Excited', icon: 'star', color: 'text-yellow-400' },
  { id: 'calm', name: 'Calm', icon: 'leaf', color: 'text-green-400' },
  { id: 'inspired', name: 'Inspired', icon: 'lightbulb', color: 'text-indigo-400' },
  { id: 'bored', name: 'Bored', icon: 'meh', color: 'text-gray-400' },
  { id: 'hopeful', name: 'Hopeful', icon: 'sun', color: 'text-yellow-300' },
  { id: 'melancholic', name: 'Melancholic', icon: 'cloud-rain', color: 'text-slate-400' },
  { id: 'fun', name: 'Want to Have Fun', icon: 'laugh', color: 'text-purple-400' }
] as const;
