import { useState } from 'react';
import { Box } from "@material-ui/core";
import { DateRange } from "@material-ui/pickers";
import DateRangeBox from "../../../components/list/DateRangeBoxV1";
import ChartCircle from '../../../components/list/ChartCircleV1';
import { useFirebase } from '../../../hooks/useFirebase';
import { IInputData } from '../../../interfaces';
import { IChartData } from '../../../components/list/ChartCircleV1';

export default function Graph() {
  const [dateRange, setDateRange] = useState<DateRange<Date>>([null, null]);
  const { inputs } = useFirebase();

  const dataList = inputsToDataList(inputs.pay);
  return (
    <>
      <Box display="flex" flexDirection="column" justifyContent="center">
        <DateRangeBox dateRange={dateRange} setDateRange={setDateRange} />
        <ChartCircle dataList={dataList} />
      </Box>
    </>
  );
}

const inputsToDataList = (inputs: IInputData[]): IChartData[] => {
  const dataList = inputs.map((input) => ({ name: input.payedCategory, value: input.price }));
  return dataList.reduce((pre: IChartData[], cur) => {
    const targetName = cur.name;
    const hasName = pre.some((data) => data.name === targetName);
    if (!hasName) {
      pre.push({
        name: targetName,
        value: cur.value,
      });
      return [ ...pre ];
    }
    return pre.map((data) => {
      if (data.name === targetName) {
        return {
          name: data.name,
          value: data.value + cur.value,
        };
      }
      return data;
    });
  }, []);
};
