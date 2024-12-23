import { Line } from 'react-chartjs-2';
import { lineChartOptions } from '../../config/chartConfig';

export function LineChart({ data, options = {} }) {
  // some comment 
  return (
    <Line 
      data={data} 
      options={{
        ...lineChartOptions,
        ...options
      }}
    />
  );
} 