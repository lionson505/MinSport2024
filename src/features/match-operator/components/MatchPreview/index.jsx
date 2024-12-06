import { Button } from '../../../../components/ui/Button';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Loader2 } from 'lucide-react';

export function MatchPreview({ match, setupData = { homeTeam: { players: [] }, awayTeam: { players: [] } }, onBack, onConfirm, loading }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Match Details</h3>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium mb-2">Home Team</h4>
            <div className="space-y-2">
              <p className="text-sm">Players: {setupData.homeTeam?.players?.length || 0}</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {setupData.homeTeam?.players?.map(player => (
                  <li key={player.id}>
                    #{player.number} - {player.name} ({player.position})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Away Team</h4>
            <div className="space-y-2">
              <p className="text-sm">Players: {setupData.awayTeam?.players?.length || 0}</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {setupData.awayTeam?.players?.map(player => (
                  <li key={player.id}>
                    #{player.number} - {player.name} ({player.position})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Match Officials</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Referee:</span> {setupData.officials?.referee}</p>
              {setupData.officials?.assistantReferee1 && (
                <p><span className="font-medium">Assistant 1:</span> {setupData.officials.assistantReferee1}</p>
              )}
            </div>
            <div>
              {setupData.officials?.assistantReferee2 && (
                <p><span className="font-medium">Assistant 2:</span> {setupData.officials.assistantReferee2}</p>
              )}
              {setupData.officials?.fourthOfficial && (
                <p><span className="font-medium">Fourth Official:</span> {setupData.officials.fourthOfficial}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          Once you start the match, you will be the designated match operator. Make sure all details are correct.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back to Officials
        </Button>
        <Button 
          onClick={onConfirm} 
          disabled={loading}
          className="min-w-[150px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            'Start Match'
          )}
        </Button>
      </div>
    </div>
  );
} 