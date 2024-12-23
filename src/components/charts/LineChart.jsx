import { Line } from 'react-chartjs-2';
import { lineChartOptions } from '../../config/chartConfig';

export function LineChart({ data, options = {} }) {
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