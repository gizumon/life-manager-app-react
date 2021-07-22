import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import { Card, CardContent, Tabs, Tab, Box } from '@material-ui/core';
import PaymentIcon from '@material-ui/icons/Payment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import { IConfigType, IInputData, IInput, IConfig } from '../../interfaces';
import { useRouter } from 'next/router';
import Utils from '../../services/utilsService';
import { useFirebase } from '../../hooks/useFirebase';

type ITabIndex = 0 | 1 | 2;
type ITabMap = {
  toType: {
    [key in ITabIndex]: IConfigType
  },
  toIndex: {
    [key in IConfigType]: ITabIndex
  },
  toName: {
    [key in IConfigType]: string
  }
};
type IDisplayMap = {
  [id in string]: string
};

type IDisplayData = {
  id: string;
  name: string;
  value: any;
};

type IDisplayDataObject = {
  [key in IConfigType]: IDisplayData[][];
};

const tabMap: ITabMap = {
  toType: {
    0: 'pay',
    1: 'todo',
    2: 'tobuy',  
  },
  toIndex: {
    pay: 0,
    todo: 1,
    tobuy: 2,
  },
  toName: {
    pay: '精算',
    todo: 'ToDoリスト',
    tobuy: '買い物リスト',
  },
}

const useStyles = makeStyles({
  table: {
    minWidth: 300,
  },
  card: {
    width: 350,
    margin: '25px 0px 65px 0px',
  },
});

function getTabProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function List() {
  const classes = useStyles();
  const router = useRouter();
  const { configs, inputs, members } = useFirebase();
  // TODO: Should use session
  const selectedId = router.query['id'] as string || Utils.getQueryParam(router.asPath, 'id') || '';
  const selectedType = router.query['type'] as string || Utils.getQueryParam(router.asPath, 'type') || 'pay';

  const [tabIndex, setTabIndex] = React.useState<ITabIndex>(tabMap.toIndex[selectedType as IConfigType] || tabMap.toIndex['pay']);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [displayMap, setDisplayMap] = React.useState<IDisplayMap>({});
  const [displayDataObj, setDisplayDataObj] = React.useState<IDisplayDataObject>({pay: [], todo: [], tobuy: []});

  useEffect(() => {
    if (configs.length > 0) {
      setIsInitialized(true);
    }
  }, [configs]);

  useEffect(() => {
    console.log('!!!inputs change:', inputs, inputs[selectedId], selectedType);
    if (inputs && inputs[selectedId] && selectedType) {
      const dataObj: IDisplayDataObject = {pay: [], todo: [], tobuy: []};
      Object.keys(inputs[selectedId]).forEach((type) => {
        inputs[selectedId][type as IConfigType].forEach((data) => {
          const list: IDisplayData[] = [];
          Object.keys(data).forEach(key => {
            list.push({
              id: key,
              name: displayMap[key],
              value: data[key as keyof IInputData],
            });
          });
          dataObj[type as IConfigType].push(list);
        });
      });
      setDisplayDataObj(dataObj);

      const map: {[key in string]: string} = {};
      getConfig(selectedType as IConfigType).inputs.forEach((input: IInput) => map[input.id] = input.name);
      setDisplayMap(map);
    }
    console.log('created displayDataObjMap', displayDataObj, displayMap);
  }, [inputs, selectedType]);

  const onTabChange = (_: React.ChangeEvent<{}>, index: ITabIndex) => {
    setTabIndex(index);
    router.push(`/list?id=${selectedId}&type=${tabMap.toType[index]}`, undefined, {shallow: true});
  };

  const getConfig = (type: IConfigType): IConfig => {
    return configs[tabMap.toIndex[type]];
  };

  // const getInputs = (index: ITabIndex): IInputData[] => {
  //   return (typeof index === 'number' && inputs && selectedId) ? inputs[selectedId][tabMap.toType[index]] : [];
  // };

  const getDisplayDataList = (type: IConfigType): IDisplayData[][] => {
    console.log(displayDataObj);
    return (displayDataObj && displayDataObj[type]) ? displayDataObj[type] : [];
  };

  // TODO: should move in utils
  const convertDisplayValue = (id: string, value: any): string => {
    const convertFnMap: {[key in keyof IInputData]?: any} = {
      payedFor: convertMembersName,
      payedCategory: convertCategoryName,
      payedBy: convertMemberName,
      timestamp: convertDatetime,
      buyCategory: convertCategoryName,
      buyBy: convertMemberName,
      doBy: convertMemberName,
    };
    const fn = convertFnMap[id as keyof IInputData];
    return fn ? fn(value) : String(value);
  };

  const convertMemberName = (id: string): string => members.find(member => member.id === id)?.name || 'Unknown';
  // const convertMembersName = (ids: string[]): string => ids.map(id => convertMemberName(id)).join(', ');
  const convertMembersName = (ids: string[]): string => {
    return (ids && ids.length > 0) ? ids.map(id => convertMemberName(id)).join(', ') : String(ids);
  };

  const convertCategoryName = (id: string): string => id;
  const convertDatetime = (timestamp: number): string => String(timestamp);

  return (
    <Box display="flex" justifyContent="center">
      <Card className={classes.card}>
        <Tabs
          variant="fullWidth"
          value={tabIndex}
          onChange={onTabChange}
          aria-label="tabs"
        >
          <Tab label={<><PaymentIcon /> Pay</>} {...getTabProps(tabMap.toIndex['pay'])} />
          <Tab label={<><AssignmentTurnedInIcon /> ToDo</>} {...getTabProps(tabMap.toIndex['todo'])} />
          <Tab label={<><AddShoppingCartIcon /> ToBuy</>} {...getTabProps(tabMap.toIndex['tobuy'])} />
        </Tabs>
        <CardContent>
          <TableContainer component={Paper}>
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  {
                    // isInitialized && getConfig(selectedType as IConfigType)?.inputs.map((input: IInput) => {
                    //   <TableCell key={input.id}>{input.name}</TableCell>
                    // })
                    isInitialized && Object.keys(displayMap).map(key => <TableCell key={key}>{displayMap[key]}</TableCell>)
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  isInitialized && getDisplayDataList(selectedType as IConfigType).map((row, index) => {
                    return (
                      <TableRow key={index}>
                        {
                          Object.keys(displayMap).map(key => {
                            const col = row.find(data => data.id === key);
                            const value = col ? convertDisplayValue(col.id, col.value) : '';
                            return (
                              <TableCell key={key} align="right">{value}</TableCell>
                            );
                          })
                        }
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
