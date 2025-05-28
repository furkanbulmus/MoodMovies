import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoodVector, MoodPreference as MoodPref } from '@/types/mood';
import { Heart, RotateCcw } from 'lucide-react';

interface MoodPreferenceProps {
  selectedMoods: MoodVector;
  onPreferenceSelected: (preference: MoodPref) => void;
  onBack: () => void;
}

export default function MoodPreference({ selectedMoods, onPreferenceSelected, onBack }: MoodPreferenceProps) {
  const [selectedChoice, setSelectedChoice] = useState<MoodPref | null>(null);

  const handleChoiceSelect = (choice: MoodPref) => {
    setSelectedChoice(choice);
  };

  const handleContinue = () => {
    if (selectedChoice) {
      onPreferenceSelected(selectedChoice);
    }
  };

  const moodNames = Object.keys(selectedMoods).join(', ');

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold mb-6">What kind of movies do you want?</h2>
        <p className="text-muted text-lg mb-4">
          You've selected: <span className="text-white font-medium">{moodNames}</span>
        </p>
        <p className="text-muted text-lg mb-12">
          Choose whether you want movies that match your current mood or help you change it
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div 
            className={`choice-card bg-card-dark border-2 rounded-xl p-8 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
              selectedChoice === 'match' 
                ? 'selected border-netflix-red' 
                : 'border-gray-700 hover:border-netflix-red'
            }`}
            onClick={() => handleChoiceSelect('match')}
          >
            <Heart className="text-4xl text-netflix-red mb-4 mx-auto" size={48} />
            <h3 className="text-2xl font-semibold mb-4">Match My Mood</h3>
            <p className="text-muted">Find movies that complement how you're currently feeling</p>
          </div>

          <div 
            className={`choice-card bg-card-dark border-2 rounded-xl p-8 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
              selectedChoice === 'change' 
                ? 'selected border-netflix-red' 
                : 'border-gray-700 hover:border-netflix-red'
            }`}
            onClick={() => handleChoiceSelect('change')}
          >
            <RotateCcw className="text-4xl text-netflix-red mb-4 mx-auto" size={48} />
            <h3 className="text-2xl font-semibold mb-4">Change My Mood</h3>
            <p className="text-muted">Discover movies that might shift your emotional state</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedChoice}
            className="bg-netflix-red hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            Get My Recommendations
            <span className="ml-2">✨</span>
          </Button>
          
          <div>
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-muted hover:text-white"
            >
              ← Back to Mood Selection
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
