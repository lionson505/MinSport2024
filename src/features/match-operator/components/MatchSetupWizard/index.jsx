import { useState } from 'react';
import { useMatchOperator } from '../../../../contexts/MatchOperatorContext';
import { TeamSetup } from '../TeamSetup';
import { OfficialsSetup } from '../OfficialsSetup';
import { MatchPreview } from '../MatchPreview';
import { Steps } from '../../../../components/ui/steps';
import { Button } from '../../../../components/ui/Button';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Loader2 } from 'lucide-react';

export function MatchSetupWizard({ match, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState({
    homeTeam: { players: [], staff: [] },
    awayTeam: { players: [], staff: [] },
    officials: {},
    gameSettings: {}
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { startLiveMatch } = useMatchOperator();

  const steps = [
    { id: 1, title: 'Team Setup' },
    { id: 2, title: 'Match Officials' },
    { id: 3, title: 'Review & Start' }
  ];

  const handleTeamSetupComplete = (teamData) => {
    setSetupData(prev => ({
      ...prev,
      homeTeam: teamData.homeTeam,
      awayTeam: teamData.awayTeam
    }));
    setCurrentStep(2);
  };

  const handleOfficialsSetupComplete = (officialsData) => {
    setSetupData(prev => ({
      ...prev,
      officials: officialsData
    }));
    setCurrentStep(3);
  };

  const handleStartMatch = async () => {
    try {
      setLoading(true);
      setError(null);
      await startLiveMatch(match.id, setupData);
      onComplete();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TeamSetup
            match={match}
            initialData={{ homeTeam: setupData.homeTeam, awayTeam: setupData.awayTeam }}
            onComplete={handleTeamSetupComplete}
          />
        );
      case 2:
        return (
          <OfficialsSetup
            match={match}
            initialData={setupData.officials}
            onComplete={handleOfficialsSetupComplete}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <MatchPreview
            match={match}
            setupData={setupData}
            onBack={() => setCurrentStep(2)}
            onConfirm={handleStartMatch}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <Steps
        steps={steps}
        currentStep={currentStep}
        onChange={setCurrentStep}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-4">
        {renderStep()}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg flex items-center gap-2">
            <Loader2 className="animate-spin" />
            <span>Starting match...</span>
          </div>
        </div>
      )}
    </div>
  );
} 