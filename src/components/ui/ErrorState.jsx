import { AlertTriangle } from 'lucide-react';
import Button from './Button';

function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AlertTriangle className="w-12 h-12 text-danger mb-4" />
      <p className="text-secondary-light dark:text-secondary-dark mb-4">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export default ErrorState; 