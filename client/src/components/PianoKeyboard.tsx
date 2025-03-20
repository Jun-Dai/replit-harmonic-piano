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
  'KeyA': 'A2', 'KeyW': 'A#2', 'KeyS': 'B2', 
  'KeyD': 'C3', 'KeyR': 'C#3', 'KeyF': 'D3', 
  'KeyT': 'D#3', 'KeyG': 'E3', 'KeyH': 'F3', 
  'KeyU': 'F#3', 'KeyJ': 'G3', 'KeyI': 'G#3', 
  'KeyK': 'A3', 'KeyO': 'A#3', 'KeyL': 'B3',
  'KeyZ': 'C4', 'KeyQ': 'C#4', 'KeyX': 'D4', 
  'KeyE': 'D#4', 'KeyC': 'E4', 'KeyV': 'F4', 
  'KeyT': 'F#4', 'KeyB': 'G4', 'KeyY': 'G#4', 
  'KeyN': 'A4', 'KeyU': 'A#4', 'KeyM': 'B4',
  'Comma': 'C5', 'KeyI': 'C#5', 'Period': 'D5', 
  'KeyO': 'D#5', 'Slash': 'E5', 'F14': 'F5', 
  'F15': 'F#5', 'F16': 'G5', 'F17': 'G#5', 
  'F18': 'A5', 'F19': 'A#5', 'F20': 'B5',
  'F21': 'C6'
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
  pianoKeys.forEach((key, i) => {
    if (!key.isBlack) {
      whiteKeyCount++;
    } else {
      // Position black keys between white keys
      blackKeyPositions[key.note] = (whiteKeyCount - 0.5) * keyStyle.whiteKeyWidth - (keyStyle.blackKeyWidth / 2);
    }
  });

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

      <div className="mt-4 text-sm text-neutral-400 flex flex-wrap items-center gap-4">
        <div className="bg-neutral-50 px-3 py-1 rounded-full shadow-sm border border-neutral-200">
          <span className="font-semibold text-primary">Tip:</span> Use your computer keyboard to play notes
        </div>
        <div className="flex space-x-2">
          <span className="bg-neutral-200 px-2 py-1 rounded text-xs">A</span>
          <span className="bg-neutral-200 px-2 py-1 rounded text-xs">S</span>
          <span className="bg-neutral-200 px-2 py-1 rounded text-xs">D</span>
          <span className="bg-neutral-200 px-2 py-1 rounded text-xs">F</span>
          <span>...</span>
        </div>
        <span>for white keys</span>
        <div className="flex space-x-2">
          <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">W</span>
          <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">E</span>
          <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">T</span>
          <span className="bg-neutral-500 text-white px-2 py-1 rounded text-xs">Y</span>
          <span>...</span>
        </div>
        <span>for black keys</span>
      </div>
    </div>
  );
};

export default PianoKeyboard;
