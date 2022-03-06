import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, Legend, ResponsiveContainer } from 'recharts';
import { getColorFromString } from '../../services/color';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export interface IChartData {
  name: string;
  value: number;
  date?: Date;
}

interface IProps {
  dataList: IChartData[];
}

const ChartCircle: React.FC<IProps> = ({ dataList }) => {

  const sum = dataList.reduce((pre, cur) => (pre + cur.value), 0);
  const sortedData = dataList.sort((a, b) => (a.value - b.value));

  const toPercent = (val: number) => {
    return (val * 100 / sum).toFixed(1);
  };

  return (
    <PieChart width={400} height={400} onMouseEnter={() => {}}>
      <Pie
        data={sortedData}
        cx={200}
        cy={200}
        innerRadius={60}
        outerRadius={110}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
        nameKey="name"
        label={({_, value}) => (`${Number(value).toLocaleString()}円`)}
        // label={({_, value}) => (`${this.toPercent(value)}%`)}
      >
        {sortedData.map((_, index) => (
          <Cell key={`cell-${index}`} fill={getColorFromString(String(index))} />
        ))}
      </Pie>
      <Legend verticalAlign="top" height={36} />
    </PieChart>
  );
}

export default ChartCircle;