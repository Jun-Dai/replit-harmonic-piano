import { useEffect, useState } from "react";
import { Note } from "@shared/schema";

interface PianoKeyboardProps {
  pianoKeys: { note: string; isBlack: boolean; }[];
  noteConfigurations: Record<string, Note>;
  playNote: (note: string) => void;
  stopNote: (note: string) => void;
  activeNotes: string[];
}

// Keyboard mapping for computer keyboard
const keyboardMap: Record<string, string> = {
  // Bottom row - C3 to B3
  'KeyZ': 'C3', 'KeyS': 'C#3', 'KeyX': 'D3', 
  'KeyD': 'D#3', 'KeyC': 'E3', 'KeyV': 'F3', 
  'KeyG': 'F#3', 'KeyB': 'G3', 'KeyH': 'G#3', 
  'KeyN': 'A3', 'KeyJ': 'A#3', 'KeyM': 'B3',
  
  // Middle row - C4 to B4 (including A4/440Hz)
  'KeyQ': 'C4', 'Digit2': 'C#4', 'KeyW': 'D4', 
  'Digit3': 'D#4', 'KeyE': 'E4', 'KeyR': 'F4', 
  'Digit5': 'F#4', 'KeyT': 'G4', 'Digit6': 'G#4', 
  'KeyY': 'A4', 'Digit7': 'A#4', 'KeyU': 'B4',
  
  // Top row - C5 to C6
  'KeyI': 'C5', 'Digit9': 'C#5', 'KeyO': 'D5', 
  'Digit0': 'D#5', 'KeyP': 'E5', 'BracketLeft': 'F5', 
  'Equal': 'F#5', 'BracketRight': 'G5',
  'Slash': 'A5', 'Quote': 'A#5', 'Enter': 'B5',
  'Period': 'C6'
};

const PianoKeyboard: React.FC<PianoKeyboardProps> = ({ 
  pianoKeys, 
  noteConfigurations, 
  playNote, 
  stopNote,
  activeNotes
}) => {
  const [keyStyle, setKeyStyle] = useState({
    whiteKeyWidth: 40,
    blackKeyWidth: 30,
    whiteKeyHeight: 150,
    blackKeyHeight: 90
  });

  // Adjust key sizes on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setKeyStyle({
          whiteKeyWidth: 20,
          blackKeyWidth: 16,
          whiteKeyHeight: 100,
          blackKeyHeight: 60
        });
      } else if (window.innerWidth < 768) {
        setKeyStyle({
          whiteKeyWidth: 30,
          blackKeyWidth: 20,
          whiteKeyHeight: 120,
          blackKeyHeight: 70
        });
      } else {
        setKeyStyle({
          whiteKeyWidth: 40,
          blackKeyWidth: 30,
          whiteKeyHeight: 150,
          blackKeyHeight: 90
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = keyboardMap[e.code];
      if (note && !e.repeat) {
        playNote(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyboardMap[e.code];
      if (note) {
        stopNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [playNote, stopNote]);

  // Get white keys only (needed for layout)
  const whiteKeys = pianoKeys.filter(key => !key.isBlack);

  // Calculate positions for black keys
  const blackKeyPositions: Record<string, number> = {};
  let whiteKeyCount = 0;
  for (let i = 0; i < pianoKeys.length; i++) {
    const key = pianoKeys[i];
    
    if (!key.isBlack) {
      whiteKeyCount++;
      
      // Check if the next key is black
      if (i + 1 < pianoKeys.length && pianoKeys[i + 1].isBlack) {
        // Position the black key after the current white key
        blackKeyPositions[pianoKeys[i + 1].note] = whiteKeyCount * keyStyle.whiteKeyWidth - (keyStyle.blackKeyWidth / 2);
      }
    }
  }

  return (
    <div className="mb-8 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">
        Piano Keyboard <span className="text-sm font-normal text-neutral-300">(A2 to C6)</span>
      </h2>
      
      <div className="relative piano-container" style={{ 
        height: keyStyle.whiteKeyHeight + 10, 
        width: "fit-content", 
        minWidth: "100%" 
      }}>
        {/* White keys */}
        {whiteKeys.map((key, index) => (
          <div 
            key={key.note}
            className={`inline-block border border-neutral-200 relative ${
              activeNotes.includes(key.note) ? 'bg-blue-100 border-blue-400' : 'bg-white'
            }`}
            style={{
              width: keyStyle.whiteKeyWidth,
              height: keyStyle.whiteKeyHeight,
              borderRadius: '0 0 4px 4px',
              zIndex: 1,
              cursor: 'pointer'
            }}
            onMouseDown={() => playNote(key.note)}
            onMouseUp={() => stopNote(key.note)}
            onMouseLeave={() => stopNote(key.note)}
          >
            <div className="text-[10px] absolute bottom-1 w-full text-center text-neutral-600">
              {key.note}
              <br/>
              <span className="text-[8px] font-mono">
                {noteConfigurations[key.note]?.frequency?.toFixed(2) || ''}
              </span>
            </div>
          </div>
        ))}
        
        {/* Black keys */}
        {pianoKeys.filter(key => key.isBlack).map((key) => (
          <div 
            key={key.note}
            className={`absolute ${
              activeNotes.includes(key.note) ? 'bg-blue-800' : 'bg-neutral-900'
            }`}
            style={{
              width: keyStyle.blackKeyWidth,
              height: keyStyle.blackKeyHeight,
              left: blackKeyPositions[key.note],
              borderRadius: '0 0 4px 4px',
              zIndex: 2,
              top: 0,
              cursor: 'pointer'
            }}
            onMouseDown={() => playNote(key.note)}
            onMouseUp={() => stopNote(key.note)}
            onMouseLeave={() => stopNote(key.note)}
          >
            <div className="text-[10px] absolute bottom-1 w-full text-center text-white">
              {key.note}
              <br/>
              <span className="text-[8px] font-mono">
                {noteConfigurations[key.note]?.frequency?.toFixed(2) || ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-neutral-400">
        <div className="bg-neutral-50 px-3 py-1 rounded-md shadow-sm border border-neutral-200 mb-2 inline-block">
          <span className="font-semibold text-primary">Tip:</span> Use your computer keyboard to play notes
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <div className="font-medium text-neutral-600 mb-1">Bottom row (C3-B3):</div>
            <div className="flex flex-wrap gap-1">
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">Z</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">S</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">X</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">D</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">C</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">V</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">G</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">B</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">H</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">N</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">J</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">M</span>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-neutral-600 mb-1">Middle row (C4-B4):</div>
            <div className="flex flex-wrap gap-1">
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">Q</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">2</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">W</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">3</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">E</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">R</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">5</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">T</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">6</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">Y</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">7</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">U</span>
            </div>
          </div>
          
          <div>
            <div className="font-medium text-neutral-600 mb-1">Top row (C5-C6):</div>
            <div className="flex flex-wrap gap-1">
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">I</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">9</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">O</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">0</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">P</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">[</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">=</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">]</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">/</span>
              <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">'</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">Enter</span>
              <span className="bg-neutral-200 px-2 py-1 rounded text-xs">.</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-neutral-500 mt-2">
          <span className="inline-block w-3 h-3 bg-neutral-200 rounded-sm mr-1"></span> White keys
          <span className="inline-block w-3 h-3 bg-neutral-500 rounded-sm ml-3 mr-1"></span> Black keys
        </div>
      </div>
    </div>
  );
};

export default PianoKeyboard;
