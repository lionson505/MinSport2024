import Spinner from './Spinner';

function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Spinner size="lg" className="mb-4" />
      <p className="text-secondary-light dark:text-secondary-dark">{message}</p>
    </div>
  );
}

export default LoadingState; 