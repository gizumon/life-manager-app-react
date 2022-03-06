import { useEffect, useState } from 'react';
import { Box } from "@material-ui/core";
import { DateRange } from "@material-ui/pickers";
import DateRangeBox from "../../components/view/DateRangeBoxV1";
import ChartCircle from '../../components/view/ChartCircleV1';
import { useFirebase } from '../../hooks/useFirebase';
import { ICategory, IInputData } from '../../interfaces';
import { IChartData } from '../../components/view/ChartCircleV1';

export default function View() {
  const { inputs, categories } = useFirebase();

  const convertBuyCategoryName = (id: string): string => categories.find((cat: ICategory) => cat.id === id)?.name || 'Unknown';
  const inputsToDataList = (inputs: IInputData[]): IChartData[] => {
    const dataList = inputs.map((input) => ({ name: convertBuyCategoryName(input.payedCategory), value: input.price }));
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

  const [dateRange, setDateRange] = useState<DateRange<Date>>([null, null]);
  const [dataList, setDataList] = useState<IChartData[]>(inputsToDataList(inputs.pay));

  useEffect(() => {
    const startDate = dateRange[0];
    const endDate = dateRange[1] || new Date();

    setDataList(inputsToDataList(inputs.pay.filter((data) => {
        const date = new Date(data.timestamp);
        return startDate < date && endDate > date;
    })));
  }, [dateRange]);

  return (
    <>
      <Box display="flex" flexDirection="column" justifyContent="center">
        <DateRangeBox dateRange={dateRange} setDateRange={setDateRange} />
        <ChartCircle dataList={dataList} />
      </Box>
    </>
  );
}
