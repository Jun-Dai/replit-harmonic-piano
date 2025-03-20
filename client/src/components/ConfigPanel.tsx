import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, FolderOpen } from "lucide-react";
import { Note } from "@shared/schema";

interface ConfigPanelProps {
  baseFrequency: number;
  setBaseFrequency: (freq: number) => void;
  decayLength: number;
  setDecayLength: (decay: number) => void;
  tuningMethod: "ratio" | "cents";
  setTuningMethod: (method: "ratio" | "cents") => void;
  currentTuningSystem: string;
  selectTuningSystem: (system: string) => void;
  noteConfigurations: Record<string, Note>;
  updateNoteConfig: (note: string, partialNote: Partial<Note>) => void;
  applyTuning: () => void;
  handleSaveConfig: () => void;
  configName: string;
  setConfigName: (name: string) => void;
  tuningConfigs: any[] | undefined;
  loadTuningConfig: (id: number) => void;
  isLoading: boolean;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  baseFrequency,
  setBaseFrequency,
  decayLength,
  setDecayLength,
  tuningMethod,
  setTuningMethod,
  currentTuningSystem,
  selectTuningSystem,
  noteConfigurations,
  updateNoteConfig,
  applyTuning,
  handleSaveConfig,
  configName,
  setConfigName,
  tuningConfigs,
  loadTuningConfig,
  isLoading
}) => {
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Helper to get display notes (limit to a subset for UI clarity)
  const getDisplayNotes = () => {
    const displayNotes = [
      'A2', 'A#2', 'B2', 'C3', 
      'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5',
      'A5', 'B5', 'C6'
    ];
    
    return Object.entries(noteConfigurations)
      .filter(([note]) => displayNotes.includes(note))
      .sort((a, b) => {
        // Sort by note name (octave first, then note)
        const octaveA = parseInt(a[0].slice(-1));
        const octaveB = parseInt(b[0].slice(-1));
        if (octaveA !== octaveB) return octaveA - octaveB;
        
        const noteA = a[0].slice(0, -1);
        const noteB = b[0].slice(0, -1);
        const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return noteOrder.indexOf(noteA) - noteOrder.indexOf(noteB);
      });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Tuning Configuration</h2>
        <div className="flex space-x-2">
          <div className="flex items-center mr-2">
            <Label htmlFor="config-name" className="mr-2">Name:</Label>
            <Input 
              id="config-name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-64"
            />
          </div>
          <Button 
            variant="default" 
            className="bg-primary"
            onClick={handleSaveConfig}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowLoadDialog(!showLoadDialog)}
            disabled={isLoading}
          >
            <FolderOpen className="h-4 w-4 mr-1" /> Load
          </Button>
        </div>
      </div>

      {showLoadDialog && (
        <div className="mb-6 p-4 border border-neutral-200 rounded-md">
          <h3 className="font-medium mb-2">Load Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {tuningConfigs && tuningConfigs.length > 0 ? (
              tuningConfigs.map((config) => (
                <Button
                  key={config.id}
                  variant="outline"
                  onClick={() => {
                    loadTuningConfig(config.id);
                    setShowLoadDialog(false);
                  }}
                  className="justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {config.name}
                </Button>
              ))
            ) : (
              <p className="text-neutral-500">No saved configurations found.</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2"
            onClick={() => setShowLoadDialog(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Frequency Section */}
        <div className="border border-neutral-200 rounded-md p-4">
          <h3 className="font-medium mb-3">Base Frequency</h3>
          
          <div className="flex items-center mb-4">
            <Label htmlFor="base-frequency" className="mr-3 font-medium">A4 =</Label>
            <Input 
              id="base-frequency"
              type="number" 
              value={baseFrequency} 
              min={400} 
              max={480} 
              step={0.01}
              onChange={(e) => setBaseFrequency(parseFloat(e.target.value))}
              className="w-24 font-mono"
            />
            <span className="ml-2">Hz</span>
            
            <div className="ml-auto">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setBaseFrequency(432)}
                className="mr-1"
              >
                432 Hz
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setBaseFrequency(440)}
              >
                440 Hz
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center">
              <Label htmlFor="decay-length" className="mr-2">Sound Decay Length:</Label>
              <div className="relative flex-grow max-w-sm">
                <Slider
                  id="decay-length"
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={[decayLength]}
                  onValueChange={(values) => setDecayLength(values[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-400 px-1 mt-1">
                  <span>Short</span>
                  <span>{decayLength.toFixed(1)}</span>
                  <span>Long</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tuning System Preset */}
        <div className="border border-neutral-200 rounded-md p-4">
          <h3 className="font-medium mb-3">Tuning System Preset</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={currentTuningSystem === "Equal Temperament" ? "default" : "outline"}
              onClick={() => selectTuningSystem("equal")}
              className={currentTuningSystem === "Equal Temperament" ? "bg-primary" : ""}
            >
              Equal Temperament
            </Button>
            <Button 
              variant={currentTuningSystem === "Pythagorean" ? "default" : "outline"}
              onClick={() => selectTuningSystem("pythagorean")}
              className={currentTuningSystem === "Pythagorean" ? "bg-primary" : ""}
            >
              Pythagorean
            </Button>
            <Button 
              variant={currentTuningSystem === "Just Intonation" ? "default" : "outline"}
              onClick={() => selectTuningSystem("just")}
              className={currentTuningSystem === "Just Intonation" ? "bg-primary" : ""}
            >
              Just Intonation
            </Button>
            <Button 
              variant={currentTuningSystem === "Quarter-comma Meantone" ? "default" : "outline"}
              onClick={() => selectTuningSystem("quarter")}
              className={currentTuningSystem === "Quarter-comma Meantone" ? "bg-primary" : ""}
            >
              Quarter-comma Meantone
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-neutral-400">
            <p>Current system: <span className="font-medium text-neutral-500">{currentTuningSystem}</span></p>
          </div>
        </div>
      </div>

      {/* Note Configuration Section */}
      <div className="mt-6">
        <h3 className="font-medium mb-4">Individual Note Configuration</h3>
        
        <div className="bg-neutral-100 p-3 rounded-md mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Tuning Method:</span>
            <RadioGroup 
              defaultValue={tuningMethod} 
              onValueChange={(value) => setTuningMethod(value as "ratio" | "cents")}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ratio" id="ratio" />
                <Label htmlFor="ratio">Just Intonation Ratio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cents" id="cents" />
                <Label htmlFor="cents">Cents Value</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Note Configuration Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-200">
                <TableHead className="font-medium">Note</TableHead>
                <TableHead className="font-medium">J.I. Ratio</TableHead>
                <TableHead className="font-medium">Cents</TableHead>
                <TableHead className="font-medium">Frequency (Hz)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getDisplayNotes().map(([noteName, note]) => (
                <TableRow key={noteName} className="hover:bg-neutral-50">
                  <TableCell>{noteName}</TableCell>
                  <TableCell>
                    {noteName === 'A4' ? (
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={note.ratioNumerator}
                          className="w-14 text-sm font-mono"
                          disabled
                        />
                        <span className="px-1">/</span>
                        <Input
                          type="number"
                          value={note.ratioDenominator}
                          className="w-14 text-sm font-mono"
                          disabled
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Input
                          type="number"
                          value={note.ratioNumerator}
                          min={1}
                          max={99}
                          step={1}
                          onChange={(e) => updateNoteConfig(noteName, { 
                            ratioNumerator: parseInt(e.target.value) 
                          })}
                          className="w-14 text-sm font-mono rounded-r-none"
                        />
                        <span className="px-1">/</span>
                        <Input
                          type="number"
                          value={note.ratioDenominator}
                          min={1}
                          max={99}
                          step={1}
                          onChange={(e) => updateNoteConfig(noteName, { 
                            ratioDenominator: parseInt(e.target.value) 
                          })}
                          className="w-14 text-sm font-mono rounded-l-none"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={note.cents}
                      min={-1200}
                      max={1200}
                      step={1}
                      onChange={(e) => updateNoteConfig(noteName, { 
                        cents: parseFloat(e.target.value) 
                      })}
                      className="w-20 text-sm font-mono"
                      disabled={noteName === 'A4'}
                    />
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono text-sm ${noteName === 'A4' ? 'font-medium text-primary' : ''}`}>
                      {note.frequency?.toFixed(2) || ''}
                    </span>
                    {noteName === 'A4' && <span className="text-xs text-neutral-400 ml-1">(reference)</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="default" 
            className="bg-primary"
            onClick={applyTuning}
          >
            Apply Tuning
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
