import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, BookOpen, X, HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the tuning system theory content
const tuningTheoryContent: Record<string, {
  title: string;
  description: string;
  theory: string;
  mathematics: string;
  history: string;
  example: string;
}> = {
  "equal": {
    title: "Equal Temperament",
    description: "The standard 12-tone equal division of the octave used in modern Western music.",
    theory: "Equal temperament divides the octave into 12 equal parts (semitones), with each semitone having a frequency ratio of the 12th root of 2 (approximately 1.0595). This creates a system where all intervals except the octave are slightly out of tune with their pure harmonic ratios, but allows for playing in all keys with equal ease.",
    mathematics: "In equal temperament, the frequency of each note is calculated as:\n\nf = f₀ × 2^(n/12)\n\nWhere f₀ is the reference frequency and n is the number of semitones from the reference note. Each semitone is exactly 100 cents.",
    history: "While the concept dates back to ancient times, equal temperament became the standard tuning system in Western music during the 18th and 19th centuries. It was a compromise that allowed keyboard instruments to play in any key without retuning, facilitating the increasingly chromatic music of the Romantic era.",
    example: "A perfect fifth in equal temperament has a ratio of approximately 1.498:1 (700 cents), slightly narrower than the pure ratio of 3:2 (701.96 cents)."
  },
  "just": {
    title: "Just Intonation",
    description: "A tuning system based on pure whole-number frequency ratios derived from the harmonic series.",
    theory: "Just intonation builds intervals using simple whole-number ratios, creating harmonically pure intervals that align with the natural overtone series. Since these pure intervals don't divide the octave equally, not all intervals in all keys can be pure simultaneously, requiring compromises or retuning when changing keys.",
    mathematics: "Just intonation ratios are expressed as simple fractions derived from the harmonic series:\n- Perfect fifth: 3:2\n- Major third: 5:4\n- Minor third: 6:5\n- Perfect fourth: 4:3\nThese ratios create the purest consonant sounds because they align with the natural harmonic series.",
    history: "Just intonation is one of the oldest tuning systems, used in many ancient traditions and cultures. It remained the predominant system in Western music until the rise of equal temperament in the 18th century. Many non-Western musical traditions still utilize forms of just intonation.",
    example: "A major chord (C-E-G) in just intonation uses the ratios 1:1, 5:4, and 3:2, creating a perfectly consonant sound with minimal beating between overtones."
  },
  "pythagorean": {
    title: "Pythagorean Tuning",
    description: "A tuning system built entirely from perfect fifths (3:2 ratio).",
    theory: "Pythagorean tuning is built by stacking perfect fifths (ratio 3:2) to generate all the notes of the scale. This creates pure perfect fifths but results in very sharp major thirds (about 81:64 instead of the pure 5:4) and an unusable diminished sixth interval known as the 'Pythagorean comma.'",
    mathematics: "Starting from a reference note, each fifth is tuned in the ratio 3:2. For example, from C:\n- G is 3:2 above C\n- D is 3:2 above G (or 9:8 above C)\n- A is 3:2 above D (or 27:16 above C)\nWhen we complete the circle of fifths and return to the starting note, we find the 12 fifths don't perfectly align with 7 octaves, creating the Pythagorean comma (ratio approximately 531441:524288 or about 23.5 cents).",
    history: "Named after the ancient Greek mathematician Pythagoras (6th century BCE), who discovered the mathematical ratios of musical intervals. This tuning system dominated Western music theory throughout the Middle Ages and was particularly important for early monophonic and later Medieval polyphonic music.",
    example: "D-A-E would sound as a stack of pure perfect fifths, while C-E would sound very sharp and somewhat dissonant compared to a pure major third."
  },
  "quarter": {
    title: "Quarter-comma Meantone",
    description: "A historical temperament that prioritizes pure major thirds at the expense of fifths.",
    theory: "Quarter-comma meantone tempers the fifths by flattening them slightly (by 1/4 of a syntonic comma, or about 5.38 cents) to create pure major thirds. This creates excellent major thirds (5:4 ratio) but results in somewhat narrow fifths and very uneven semitones, with diatonic semitones larger than chromatic ones.",
    mathematics: "In quarter-comma meantone, all major thirds are pure with a ratio of exactly 5:4 (386.3 cents). Fifths are tempered to a ratio of approximately 1.495:1 (696.6 cents), slightly narrower than the pure 3:2 (701.96 cents). The wolf fifth that completes the circle of fifths is extremely dissonant.",
    history: "Quarter-comma meantone was widely used during the Renaissance and early Baroque periods (15th-17th centuries). It was particularly suited to the music of composers like Palestrina and Monteverdi, who emphasized the importance of pure triadic harmony. As music became more chromatic, its limitations became more apparent.",
    example: "C-E would be a pure major third with ratio 5:4, while G#-Eb (the 'wolf' interval) would be unusably wide and dissonant."
  },
  "werckmeister3": {
    title: "Werckmeister III",
    description: "A well-temperament designed to make all keys playable while preserving the unique character of each key.",
    theory: "Werckmeister III is a well-temperament (not equal temperament) that modifies the tuning of certain fifths to distribute the Pythagorean comma across the circle of fifths. It makes all keys playable while preserving tonal differences between keys, with some keys sounding more 'pure' than others.",
    mathematics: "In Werckmeister III, only four fifths are tempered (C-G, G-D, D-A, and B-F#), each reduced by 1/4 comma. The remaining eight fifths are pure 3:2 ratios. This creates a system where intervals in simpler keys (with fewer accidentals) are closer to just intonation.",
    history: "Developed by Andreas Werckmeister in 1691, this tuning system was one of the first well-temperaments and was likely the sort of tuning that Bach had in mind when composing 'The Well-Tempered Clavier.' It represented a compromise between the purity of meantone tuning and the versatility needed for increasingly chromatic music.",
    example: "Keys with few sharps or flats (like C major) have nearly pure thirds, while remote keys (like F# major) have more noticeable beating but are still usable, giving each key its own unique 'color' or character."
  },
  "kirnberger3": {
    title: "Kirnberger III",
    description: "A historical well-temperament that preserves pure intervals in common keys.",
    theory: "Kirnberger III is a well-temperament that features pure fifths for most of the circle of fifths, with the Pythagorean comma distributed across just a few intervals. This creates a system where some keys sound quite pure while others have more character or tension.",
    mathematics: "In Kirnberger III, the fifths C-G, G-D, and D-A are all pure 3:2 ratios. The fifth A-E is tempered by 1/4 comma, and the fifth E-B is tempered by the remaining comma. This creates pure major thirds in keys like C major while allowing all keys to be playable.",
    history: "Developed by Johann Philipp Kirnberger, a student of J.S. Bach, in the late 18th century. Kirnberger attempted to create a tuning system that preserved the pure intervals that Bach favored while making all keys accessible for performance.",
    example: "The C-E major third is pure (5:4 ratio), while more remote intervals show increasing levels of tempering, giving each key its own distinct character."
  },
  "youngWellTuned": {
    title: "Young's Well-Tuned Piano",
    description: "A specialized just intonation tuning developed by minimalist composer La Monte Young.",
    theory: "La Monte Young's Well-Tuned Piano uses an extended just intonation system based on the 7-limit (using ratios with factors up to 7). The tuning avoids the standard 4:3 perfect fourth in favor of more complex ratios, creating a unique sonority that forms the basis for Young's extended piano performances.",
    mathematics: "Originally centered around E-flat but transposed to C in our implementation, Young's tuning uses pure ratios like 1:1, 9:8, 7:4, 3:2, but replaces the conventional 4:3 fourth with more complex ratios including 1323:1024 and 189:128, creating a distinctive harmonic world that emphasizes the 7th harmonic.",
    history: "Developed by American minimalist composer La Monte Young in the 1960s for his work 'The Well-Tuned Piano,' a major composition that often lasts 5-6 hours in performance. Young meticulously tuned his piano to these specific ratios to create sustained, resonant harmonies with minimal beating.",
    example: "Extended harmonies built on 7-limit ratios create shimmering, resonant clouds of sound with minimal beating between overtones, allowing for sustained harmonies not possible in conventional tunings."
  },
  "centaur": {
    title: "7-limit Centaur",
    description: "A modern just intonation tuning system utilizing harmonics up to the 7th.",
    theory: "The 7-limit Centaur tuning is based on extending just intonation to include ratios using the prime number 7, creating a richer harmonic palette. The system embraces the 'blue' notes created by the 7th harmonic, which fall between the notes of conventional Western scales.",
    mathematics: "7-limit just intonation adds the prime number 7 to the more common 3- and 5-limit ratios. This creates unique intervals like 21:20 (a small minor second from C to C#), 7:6 (a smaller minor third), 7:5 (a tritone alternative), and 14:9 (a slightly flatter minor sixth). The 7:4 ratio creates a harmonic seventh that falls between the minor and major seventh of equal temperament.",
    history: "7-limit tuning systems gained prominence in 20th century experimental music, particularly through the work of composers like Harry Partch, Ben Johnston, and others who sought to expand beyond the limitations of 12-tone equal temperament and explore the harmonic spaces defined by higher prime numbers.",
    example: "The 21:20 ratio (C to C#) creates a very small minor second of about 85 cents, smaller than the equal-tempered 100 cents. The 14:9 ratio for G# produces a minor sixth at 765 cents (compared to 800 cents in equal temperament). The 7:4 ratio for A# creates a distinctive 'harmonic seventh' at 969 cents that sounds neither minor nor major, with a consonant bluesy quality not available in standard tuning."
  }
};

interface TuningTheoryModalProps {
  currentTuningSystem: string;
}

const TuningTheoryModal: React.FC<TuningTheoryModalProps> = ({ currentTuningSystem }) => {
  // Get the system key from the system name
  const getSystemKey = (systemName: string): string => {
    const keyMap: Record<string, string> = {
      "Equal Temperament": "equal",
      "Just Intonation": "just",
      "Pythagorean": "pythagorean",
      "Quarter-comma Meantone": "quarter",
      "Werckmeister III": "werckmeister3",
      "Kirnberger III": "kirnberger3",
      "Young's Well-Tuned Piano (C)": "youngWellTuned",
      "7-limit Centaur": "centaur"
    };
    return keyMap[systemName] || "equal";
  };

  const systemKey = getSystemKey(currentTuningSystem);
  const content = tuningTheoryContent[systemKey];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <HelpCircle size={16} />
          <span>Learn about {currentTuningSystem}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl gap-2">
            <BookOpen className="h-5 w-5" />
            {content.title}
          </DialogTitle>
          <DialogDescription>
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <Tabs defaultValue="theory" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="theory">Theory</TabsTrigger>
              <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="example">Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="theory" className="space-y-2">
              <div className="text-sm space-y-4">
                <h3 className="text-lg font-semibold">Musical Theory</h3>
                <p className="whitespace-pre-line">{content.theory}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="mathematics" className="space-y-2">
              <div className="text-sm space-y-4">
                <h3 className="text-lg font-semibold">Mathematical Basis</h3>
                <p className="whitespace-pre-line">{content.mathematics}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-2">
              <div className="text-sm space-y-4">
                <h3 className="text-lg font-semibold">Historical Context</h3>
                <p className="whitespace-pre-line">{content.history}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="example" className="space-y-2">
              <div className="text-sm space-y-4">
                <h3 className="text-lg font-semibold">Practical Examples</h3>
                <p className="whitespace-pre-line">{content.example}</p>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TuningTheoryModal;