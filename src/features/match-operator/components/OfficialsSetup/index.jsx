import { useState } from 'react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

export function OfficialsSetup({ match, initialData, onComplete, onBack }) {
  const [officials, setOfficials] = useState(initialData || {
    referee: '',
    assistantReferee1: '',
    assistantReferee2: '',
    fourthOfficial: '',
    videoAssistant: match.gameType === 'football' ? '' : undefined
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(officials);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Main Officials</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Main Referee</label>
            <Input
              required
              value={officials.referee}
              onChange={(e) => setOfficials(prev => ({
                ...prev,
                referee: e.target.value
              }))}
            />
          </div>

          {match.gameType === 'football' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assistant Referee 1</label>
                <Input
                  required
                  value={officials.assistantReferee1}
                  onChange={(e) => setOfficials(prev => ({
                    ...prev,
                    assistantReferee1: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assistant Referee 2</label>
                <Input
                  required
                  value={officials.assistantReferee2}
                  onChange={(e) => setOfficials(prev => ({
                    ...prev,
                    assistantReferee2: e.target.value
                  }))}
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Additional Officials</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Fourth Official</label>
            <Input
              value={officials.fourthOfficial}
              onChange={(e) => setOfficials(prev => ({
                ...prev,
                fourthOfficial: e.target.value
              }))}
            />
          </div>

          {match.gameType === 'football' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Assistant Referee</label>
              <Input
                value={officials.videoAssistant}
                onChange={(e) => setOfficials(prev => ({
                  ...prev,
                  videoAssistant: e.target.value
                }))}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Team Setup
        </Button>
        <Button type="submit">
          Continue to Review
        </Button>
      </div>
    </form>
  );
} 