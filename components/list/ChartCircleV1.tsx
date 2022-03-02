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

export default class ChartCircle extends PureComponent<IProps> {

  private sum = this.props.dataList.reduce((pre, cur) => (pre + cur.value), 0);
  private sortedData = this.props.dataList.sort((a, b) => (a.value - b.value));

  toPercent(val: number) {
    return (val * 100 / this.sum).toFixed(1);
  }

  render() {
    return (
      <PieChart width={400} height={400} onMouseEnter={() => {}}>
        <Pie
          data={this.sortedData}
          cx={200}
          cy={200}
          innerRadius={60}
          outerRadius={120}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
          label={({_, value}) => (`${this.toPercent(value)}%`)}
        >
          {this.sortedData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={getColorFromString(String(index))} />
          ))}
        </Pie>
        <Legend verticalAlign="top" height={36} />
      </PieChart>
    );
  }
}
