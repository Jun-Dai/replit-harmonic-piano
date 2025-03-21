import { useEffect, useState } from "react";
import PianoKeyboard from "@/components/PianoKeyboard";
import ConfigPanel from "@/components/ConfigPanel";
import InfoPanel from "@/components/InfoPanel";
import { Note, TuningConfig } from "@shared/schema";
import { createAudioContext, getStandardNoteRange } from "@/lib/piano";
import { calculateFrequency, initializeTunings, parseRatioString, ratioToCents, centsToRatio } from "@/lib/tuning";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Music, AlertCircle } from "lucide-react";

// Type for currently playing note
interface CurrentlyPlaying {
  note: string;
  frequency: number;
  tuning: string;
}

const Piano = () => {
  const { toast } = useToast();
  
  // Audio context state
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [activeOscillators, setActiveOscillators] = useState<Record<string, OscillatorNode>>({});
  const [activeGainNodes, setActiveGainNodes] = useState<Record<string, GainNode>>({});
  
  // Configuration state
  const [baseFrequency, setBaseFrequency] = useState<number>(440);
  const [decayLength, setDecayLength] = useState<number>(3.0);
  const [tuningMethod, setTuningMethod] = useState<"ratio" | "cents">("cents");
  const [currentTuningSystem, setCurrentTuningSystem] = useState<string>("Equal Temperament");
  const [configId, setConfigId] = useState<number | null>(null);
  const [configName, setConfigName] = useState<string>("My Custom Tuning");
  
  // Piano keys and tuning state
  const [pianoKeys, setPianoKeys] = useState(getStandardNoteRange("A2", "C6"));
  const [noteConfigurations, setNoteConfigurations] = useState<Record<string, Note>>({});
  
  // Currently playing note
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null);

  // Load saved configurations
  const { data: tuningConfigs, isLoading, isError } = useQuery<TuningConfig[]>({
    queryKey: ['/api/tuning-configs'],
  });

  // Initialize default tuning configurations
  useEffect(() => {
    const initialTunings = initializeTunings(baseFrequency);
    setNoteConfigurations(initialTunings);
  }, []);

  // Update frequencies when base frequency changes
  useEffect(() => {
    if (Object.keys(noteConfigurations).length > 0) {
      const updatedNotes: Record<string, Note> = {};
      
      for (const [noteName, note] of Object.entries(noteConfigurations)) {
        const frequency = calculateFrequency(noteName, baseFrequency, note.ratioNumerator, note.ratioDenominator, note.cents);
        updatedNotes[noteName] = {
          ...note,
          frequency
        };
      }
      
      setNoteConfigurations(updatedNotes);
    }
  }, [baseFrequency]);

  // Initialize Audio Context on first user interaction
  const initAudio = () => {
    if (!audioCtx) {
      const context = createAudioContext();
      setAudioCtx(context);
    }
  };

  // Play a note
  const playNote = (noteName: string) => {
    if (!audioCtx) {
      initAudio();
      return; // Return early as the context is initializing
    }
    
    // Make sure note exists in our configuration
    if (!noteConfigurations[noteName]) return;
    
    // If this note is already playing, stop it first
    if (activeOscillators[noteName]) {
      stopNote(noteName);
    }
    
    // Create oscillator and gain node
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Calculate the frequency for this note
    const frequency = noteConfigurations[noteName].frequency || 
      calculateFrequency(noteName, baseFrequency, 
        noteConfigurations[noteName].ratioNumerator, 
        noteConfigurations[noteName].ratioDenominator,
        noteConfigurations[noteName].cents);
    
    // Set oscillator type and frequency
    oscillator.type = 'triangle'; // A more piano-like sound
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    // Connect to gain node and then to output
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Start playing
    oscillator.start();
    
    // Apply decay
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001, audioCtx.currentTime + decayLength
    );
    
    // Store references to stop the sound later
    setActiveOscillators(prev => ({ ...prev, [noteName]: oscillator }));
    setActiveGainNodes(prev => ({ ...prev, [noteName]: gainNode }));
    
    // Update currently playing info
    setCurrentlyPlaying({
      note: noteName,
      frequency,
      tuning: noteName === 'A4' ? 'Reference Note' : 
        `${tuningMethod === 'ratio' ? 
          (noteConfigurations[noteName].ratio || 
           `${noteConfigurations[noteName].ratioNumerator}/${noteConfigurations[noteName].ratioDenominator}`) : 
          `${noteConfigurations[noteName].cents} cents`}`
    });
    
    // Schedule automatic note stop
    setTimeout(() => {
      stopNote(noteName);
    }, decayLength * 1000);
  };

  // Stop a note
  const stopNote = (noteName: string) => {
    if (activeOscillators[noteName]) {
      activeOscillators[noteName].stop();
      activeOscillators[noteName].disconnect();
      activeGainNodes[noteName].disconnect();
      
      setActiveOscillators(prev => {
        const newOscillators = { ...prev };
        delete newOscillators[noteName];
        return newOscillators;
      });
      
      setActiveGainNodes(prev => {
        const newGainNodes = { ...prev };
        delete newGainNodes[noteName];
        return newGainNodes;
      });
      
      // Clear currently playing if this was the last note
      if (Object.keys(activeOscillators).length <= 1) {
        setCurrentlyPlaying(null);
      }
    }
  };

  // Update note configuration
  const updateNoteConfig = (noteName: string, partialNote: Partial<Note>) => {
    if (noteConfigurations[noteName]) {
      const updatedNote = {
        ...noteConfigurations[noteName],
        ...partialNote
      };
      
      // If ratio was provided as a string, parse it and update numerator/denominator
      if (partialNote.ratio) {
        const [num, denom] = parseRatioString(partialNote.ratio);
        updatedNote.ratioNumerator = num;
        updatedNote.ratioDenominator = denom;
      }
      
      // Calculate updated frequency
      updatedNote.frequency = calculateFrequency(
        noteName, 
        baseFrequency, 
        updatedNote.ratioNumerator, 
        updatedNote.ratioDenominator,
        updatedNote.cents
      );
      
      setNoteConfigurations(prev => ({
        ...prev,
        [noteName]: updatedNote
      }));
    }
  };

  // Apply current tuning to all notes
  const applyTuning = () => {
    // Update all frequencies based on current tuning parameters
    const updatedNotes: Record<string, Note> = {};
    
    for (const [noteName, note] of Object.entries(noteConfigurations)) {
      const frequency = calculateFrequency(
        noteName, 
        baseFrequency, 
        note.ratioNumerator, 
        note.ratioDenominator,
        note.cents
      );
      
      updatedNotes[noteName] = {
        ...note,
        frequency
      };
    }
    
    setNoteConfigurations(updatedNotes);
    
    toast({
      title: "Tuning Applied",
      description: "The custom tuning has been applied to all notes.",
      duration: 3000
    });
  };

  // Save tuning configuration mutation
  const saveTuningMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = configId ? "PUT" : "POST";
      const url = configId ? `/api/tuning-configs/${configId}` : "/api/tuning-configs";
      return apiRequest(method, url, data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setConfigId(data.id);
      toast({
        title: "Success",
        description: "Tuning configuration saved successfully",
        duration: 3000
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save tuning configuration: ${error.message}`,
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Load tuning configuration mutation
  const loadTuningMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("GET", `/api/tuning-configs/${id}`);
    },
    onSuccess: async (response) => {
      const config = await response.json();
      setBaseFrequency(config.baseFrequency);
      setDecayLength(config.decayLength);
      setNoteConfigurations(config.notes);
      setConfigId(config.id);
      setConfigName(config.name);
      
      toast({
        title: "Success",
        description: `Loaded tuning configuration: ${config.name}`,
        duration: 3000
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to load tuning configuration: ${error.message}`,
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Handle toggling between ratio and cents methods
  const handleTuningMethodChange = (method: "ratio" | "cents") => {
    if (method === tuningMethod) return; // No change
    
    // Create a copy of the current note configurations
    const updatedNotes = { ...noteConfigurations };
    
    // Get all unique base notes
    const baseNotes = new Set<string>();
    Object.values(updatedNotes).forEach(note => {
      if (note.baseName) {
        baseNotes.add(note.baseName);
      }
    });
    
    // Convert values for each base note
    baseNotes.forEach(baseName => {
      // Skip A (reference note) or empty baseName
      if (!baseName || baseName === 'A') return;
      
      // Find the first note with this base name
      const noteKey = Object.keys(updatedNotes).find(key => updatedNotes[key].baseName === baseName);
      if (!noteKey) return;
      
      const note = updatedNotes[noteKey];
      
      if (method === "cents" && note.ratioNumerator > 0 && note.ratioDenominator > 0) {
        // Converting from ratio to cents
        const newCents = ratioToCents(note.ratioNumerator, note.ratioDenominator);
        
        // Update all notes with this base name
        Object.keys(updatedNotes)
          .filter(key => updatedNotes[key].baseName === baseName)
          .forEach(key => {
            updatedNotes[key] = {
              ...updatedNotes[key],
              cents: parseFloat(newCents.toFixed(1))
            };
          });
      } 
      else if (method === "ratio" && note.cents !== 0) {
        // Converting from cents to ratio
        const [num, denom] = centsToRatio(note.cents);
        
        // Update all notes with this base name
        Object.keys(updatedNotes)
          .filter(key => updatedNotes[key].baseName === baseName)
          .forEach(key => {
            updatedNotes[key] = {
              ...updatedNotes[key],
              ratioNumerator: num,
              ratioDenominator: denom,
              ratio: `${num}/${denom}`
            };
          });
      }
    });
    
    // Update the state
    setNoteConfigurations(updatedNotes);
    setTuningMethod(method);
    
    // Notify user
    toast({
      title: `Tuning Method: ${method === "ratio" ? "Just Intonation Ratio" : "Cents"}`,
      description: `Converted tuning values to ${method === "ratio" ? "ratio" : "cents"} format.`,
      duration: 3000
    });
  };
  
  // Save current configuration
  const handleSaveConfig = () => {
    saveTuningMutation.mutate({
      name: configName,
      baseFrequency,
      decayLength,
      notes: noteConfigurations
    });
  };

  // Select a tuning system preset
  const selectTuningSystem = (system: string) => {
    const presets = {
      "equal": "Equal Temperament",
      "just": "Just Intonation",
      "pythagorean": "Pythagorean",
      "quarter": "Quarter-comma Meantone",
      "werckmeister3": "Werckmeister III",
      "kirnberger3": "Kirnberger III"
    };
    
    setCurrentTuningSystem(presets[system as keyof typeof presets] || system);
    
    // Apply the selected tuning system
    const tunings = initializeTunings(baseFrequency, system);
    setNoteConfigurations(tunings);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Music size={24} />
            Custom Tunable Piano
          </h1>
          <p className="text-sm opacity-80">Experiment with just intonation and custom tuning systems</p>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-grow">
        {/* Piano Keyboard Component */}
        <PianoKeyboard 
          pianoKeys={pianoKeys}
          noteConfigurations={noteConfigurations}
          playNote={playNote}
          stopNote={stopNote}
          activeNotes={Object.keys(activeOscillators)}
        />

        {/* Configuration Panel Component */}
        <ConfigPanel
          baseFrequency={baseFrequency}
          setBaseFrequency={setBaseFrequency}
          decayLength={decayLength}
          setDecayLength={setDecayLength}
          tuningMethod={tuningMethod}
          setTuningMethod={handleTuningMethodChange}
          currentTuningSystem={currentTuningSystem}
          selectTuningSystem={selectTuningSystem}
          noteConfigurations={noteConfigurations}
          updateNoteConfig={updateNoteConfig}
          applyTuning={applyTuning}
          handleSaveConfig={handleSaveConfig}
          configName={configName}
          setConfigName={setConfigName}
          tuningConfigs={tuningConfigs}
          loadTuningConfig={(id) => loadTuningMutation.mutate(id)}
          isLoading={saveTuningMutation.isPending || loadTuningMutation.isPending}
        />

        {/* Info Panel Component */}
        <InfoPanel 
          currentlyPlaying={currentlyPlaying}
        />
      </main>

      <footer className="bg-neutral-200 p-4 text-neutral-500 text-sm">
        <div className="container mx-auto">
          <p>Custom Tunable Piano - Created with Web Audio API</p>
        </div>
      </footer>
    </div>
  );
};

export default Piano;
