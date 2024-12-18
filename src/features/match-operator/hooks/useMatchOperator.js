import { useContext } from 'react';
import { MatchOperatorContext } from '../../../contexts/MatchOperatorContext';

export const useMatchOperator = () => {
  const context = useContext(MatchOperatorContext);
  if (!context) {
    throw new Error('useMatchOperator must be used within a MatchOperatorProvider');
  }
  return context;
}; 