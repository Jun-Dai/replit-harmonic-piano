import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useState } from "react";

interface InfoPanelProps {
  currentlyPlaying: {
    note: string;
    frequency: number;
    tuning: string;
  } | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ currentlyPlaying }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Currently Playing</h2>
          <div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-6">
          <div className="min-w-[200px]">
            <div className="text-sm text-neutral-500 mb-1">Note</div>
            <div className="text-2xl font-medium">{currentlyPlaying?.note || '-'}</div>
          </div>
          <div className="min-w-[200px]">
            <div className="text-sm text-neutral-500 mb-1">Frequency</div>
            <div className="text-2xl font-mono">
              {currentlyPlaying ? `${currentlyPlaying.frequency.toFixed(2)} Hz` : '-'}
            </div>
          </div>
          <div className="min-w-[200px]">
            <div className="text-sm text-neutral-500 mb-1">Tuning</div>
            <div className="text-lg">{currentlyPlaying?.tuning || '-'}</div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-md">
            <h3 className="font-medium mb-2">About Just Intonation and Cents</h3>
            <p className="text-sm text-neutral-600 mb-2">
              <strong>Just Intonation</strong> uses whole number ratios to tune intervals. 
              This creates mathematically "pure" harmony but means that intervals can vary between keys.
            </p>
            <p className="text-sm text-neutral-600 mb-2">
              <strong>Cents</strong> are a logarithmic unit of measure for musical intervals. 
              One octave equals 1200 cents, and one semitone in equal temperament equals 100 cents.
            </p>
            <p className="text-sm text-neutral-600">
              A deviation of just a few cents from equal temperament can create beatless consonances 
              or interesting microtonal effects.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoPanel;
