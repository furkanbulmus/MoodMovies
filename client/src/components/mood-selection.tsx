import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { MOODS, MoodVector } from '@/types/mood';
import { 
  Smile, Frown, AlertTriangle, Angry, Heart, Star, 
  Leaf, Lightbulb, Meh, Sun, CloudRain, Laugh 
} from 'lucide-react';

const MOOD_ICONS = {
  smile: Smile,
  frown: Frown,
  'exclamation-triangle': AlertTriangle,
  angry: Angry,
  heart: Heart,
  star: Star,
  leaf: Leaf,
  lightbulb: Lightbulb,
  meh: Meh,
  sun: Sun,
  'cloud-rain': CloudRain,
  laugh: Laugh,
};

interface MoodSelectionProps {
  onComplete: (moods: MoodVector) => void;
  onBack: () => void;
}

export default function MoodSelection({ onComplete, onBack }: MoodSelectionProps) {
  const [selectedMoods, setSelectedMoods] = useState<Record<string, number>>({});

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev => {
      const newMoods = { ...prev };
      if (newMoods[moodId]) {
        delete newMoods[moodId];
      } else {
        newMoods[moodId] = 5; // Default intensity
      }
      return newMoods;
    });
  };

  const updateMoodIntensity = (moodId: string, intensity: number) => {
    setSelectedMoods(prev => ({
      ...prev,
      [moodId]: intensity
    }));
  };

  const handleContinue = () => {
    if (Object.keys(selectedMoods).length > 0) {
      onComplete(selectedMoods);
    }
  };

  const hasSelectedMoods = Object.keys(selectedMoods).length > 0;

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Select Your Current Mood</h2>
          <p className="text-muted text-lg">Choose as many moods as you like and adjust their intensity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {MOODS.map((mood) => {
            const IconComponent = MOOD_ICONS[mood.icon as keyof typeof MOOD_ICONS];
            const isSelected = selectedMoods[mood.id] !== undefined;
            
            return (
              <div
                key={mood.id}
                className={`mood-card bg-card-dark border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'selected border-netflix-red' 
                    : 'border-gray-700 hover:border-netflix-red'
                }`}
                onClick={() => toggleMood(mood.id)}
              >
                <div className="text-center">
                  <IconComponent className={`text-3xl mb-3 mx-auto ${mood.color}`} size={32} />
                  <h3 className="font-semibold text-lg">{mood.name}</h3>
                </div>
                
                {isSelected && (
                  <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-sm text-muted mb-2">
                      Intensity: <span className="font-medium">{selectedMoods[mood.id]}</span>
                    </label>
                    <Slider
                      value={[selectedMoods[mood.id]]}
                      onValueChange={([value]) => updateMoodIntensity(mood.id, value)}
                      max={10}
                      min={0}
                      step={1}
                      className="mood-range"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <Button
            onClick={handleContinue}
            disabled={!hasSelectedMoods}
            className="bg-netflix-red hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            Continue to Preferences
            <span className="ml-2">→</span>
          </Button>
          
          <div>
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-muted hover:text-white"
            >
              ← Back to Welcome
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
