import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
         Paper, Avatar, Link, Grid, List, ListItem, ListItemText } from '@material-ui/core';
import { Card, CardContent, Tabs, Tab, Box, Chip } from '@material-ui/core';
import PaymentIcon from '@material-ui/icons/Payment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import { IConfigType, IInputData, IInput, IConfig } from '../../interfaces';
import { useRouter } from 'next/router';
import Utils from '../../services/utilsService';
import { useFirebase } from '../../hooks/useFirebase';
import theme from '../../styles/theme';
// import ExpandMoreIcon from '@material-ui/icons/Details';
import { ICategory } from '../../interfaces/index';
import FadeWrapper from '../../components/FadeWrapper';
import Progress from '../../components/AnimationProgressV1';
import CircularProgressV1 from '../../components/CircularProgressV1';
import { DialogV1 } from '../../components/DialogV1';

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
  dataId: string;
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
  card: {
    width: 350,
    margin: '25px 0px 65px 0px',
  },
  tableContainer: {
    maxHeight: 320,
  },
  table: {
    minWidth: 300,
    whiteSpace: 'nowrap',
    '&> thead > tr > th': {
      backgroundColor: theme.palette.secondary.dark,
      color: '#fff',
      fontWeight: 700,
      padding: '6px 10px',
    },
  },
  avatarBlock: {
    display: 'flex',
    '& .MuiAvatar-circle': {
      width: 20,
      height: 20,
    }
  },
  chips: {
    marginBottom: '5px',
    fontWeight: 700,
    color: '#fff',
    backgroundColor: theme.palette.error.main,
    opacity: 0.9,
  },
  messageBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderTop: 'solid 5px #eb8a44',
    fontSize: '1rem',
    fontWeight: 700,
    boxShadow: '0 3px 5px rgb(0 0 0 / 22%)',
    '&> a': {
      marginRight: '7px',
      fontSize: '1.2rem',
      fontWeight: 900,
    }
  },
});

const displayPictures: (keyof IInputData)[] = [
  'payedFor', 'payedBy', 'buyBy', 'doBy'
];

function getTabProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

// const VirtualizeSwipeableViews = virtualize(SwipeableViews);
// const slideRenderer = (_, index: number, children: any) => {
//   const isActiveEdit = index % 2 === 1;
//   return <>{children}</>
// }

export default function ListPage() {
  const classes = useStyles();
  const router = useRouter();
  // TODO: Should handle no inputs case 
  const { configs, inputs, groupMembers, categories, activateGroup, isInitialized, deleteInput } = useFirebase();

  // TODO: Should use session
  const selectedId = sessionStorage.getItem('gid') || '';
  const selectedType = router.query['type'] as string || Utils.getQueryParam(router.asPath, 'type') || 'pay';

  const [tabIndex, setTabIndex] = React.useState<ITabIndex>(tabMap.toIndex[selectedType as IConfigType] || tabMap.toIndex['pay']);
  const [isPageInitialized, setIsPageInitialized] = React.useState<boolean>(false);
  const [displayMap, setDisplayMap] = React.useState<IDisplayMap>({});
  const [displayDataObj, setDisplayDataObj] = React.useState<IDisplayDataObject>({pay: [], todo: [], tobuy: []});
  const [targetId, setTargetId] = React.useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);

  useEffect(() => {
    if (activateGroup && selectedId) {
      activateGroup(selectedId);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (configs.length > 0) {
      setIsPageInitialized(true);
    }
  }, [configs]);

  useEffect(() => {
    if (inputs && selectedType) {
      const map: {[key in string]: string} = {};
      const inputConfigs = getConfig(selectedType as IConfigType)?.inputs;
      inputConfigs?.forEach((input: IInput) => {
        if (!input.isHideList) {
          map[input.id] = input.name;
        }
      });
      const sortedMap = Utils.sortObject(map, (key1: string, key2: string): number => {
        const order1 = inputConfigs.find(input => input.id === key1[0])?.order || 100;
        const order2 = inputConfigs.find(input => input.id === key2[0])?.order || 100;
        return order1 < order2 ? -1 : order1 > order2 ? 1 : 0;
      });
      setDisplayMap(sortedMap);

      const dataObj: IDisplayDataObject = {pay: [], todo: [], tobuy: []};
      Object.keys(inputs).forEach((type) => {
        inputs[type as IConfigType].forEach((data) => {
          const list: IDisplayData[] = [];
          Object.keys(data).forEach(key => {
            const isValid = !!sortedMap[key];
            if (isValid) {
              list.push({
                id: key,
                dataId: data.id,
                name: displayMap[key],
                value: data[key as keyof IInputData],
              });
            }
          });
          dataObj[type as IConfigType].push(list);
        });
      });
      setDisplayDataObj(dataObj);
    }
    console.log('created displayDataObjMap', displayDataObj, displayMap);
  }, [inputs, selectedType, selectedId]);

  const onTabChange = (_: React.ChangeEvent<{}>, index: ITabIndex) => {
    setTabIndex(index);
    router.push(Utils.makeUrl('/list', tabMap.toType[index]), undefined, {shallow: true});
  };

  const onCloseHandler = (value?: string) => {
    setIsDeleteModalOpen(false);
    if (value && deleteInput && activateGroup) {
      deleteInput(selectedId, selectedType as IConfigType, value).then(() => {
        activateGroup(selectedId);
      }).catch(() => console.log('failed to delete'));
    }
  };

  const onRowClickHandler: React.MouseEventHandler<HTMLTableRowElement> = (e) => {
    setTargetId(e.currentTarget.getAttribute('data-id') || '')
    setIsDeleteModalOpen(true);
  }

  const getConfig = (type: IConfigType): IConfig => {
    return configs[tabMap.toIndex[type]];
  };

  const getDisplayDataList = (type: IConfigType): IDisplayData[][] => {
    return (displayDataObj && displayDataObj[type]) ? displayDataObj[type] : [];
  };

  const getCalculations = (): {id: string, name: string, picture: string, shouldReceive: number, shouldPay: number, diff: number, hasReimbursement: Boolean}[] => {
    // way: calculate the amount payed for someone
    const arr: {id: string, name: string, picture: string, shouldReceive: number, shouldPay: number, diff: number, hasReimbursement: Boolean}[] = [];
    groupMembers.forEach((member) => {
      const calcObj = {
        id: member.id || '',
        name: member.name,
        picture: member.picture || '',
        shouldReceive: 0,
        shouldPay: 0,
        diff: 0,
        hasReimbursement: false
      };
      inputs['pay'].forEach((row) => {
        const payed = row.payedBy === calcObj.id;
        const isPayed = row.payedFor.includes(calcObj.id);
        if (payed) {
          calcObj.shouldReceive += isPayed ? (row.price - (row.price / row.payedFor.length)) : row.price;
        }
        if (isPayed) {
          calcObj.shouldPay += payed ? 0 : (row.price / row.payedFor.length);
        }
      });
      calcObj.diff = calcObj.shouldReceive - calcObj.shouldPay;
      calcObj.hasReimbursement = calcObj.diff <= 0;
      arr.push(calcObj);
    });
    return arr;
  };

  // TODO: should move in utils
  const convertDisplayValue = (id: string, value: any): string | string[] => {
    const convertFnMap: {[key in keyof IInputData]?: any} = {
      payedFor: convertMemberIcons,
      payedCategory: convertPayedCategoryName,
      payedBy: convertMemberIcon,
      timestamp: convertDatetime,
      buyCategory: convertBuyCategoryName,
      buyBy: convertMemberIcon,
      doBy: convertMemberIcon,
      price: convertNumber,
    };
    const fn = convertFnMap[id as keyof IInputData];
    return fn ? fn(value) : String(value);
  };

  const convertMemberIcon = (id: string): string[] => {
    return id === 'ALL' ? ['全員']
         : groupMembers.find(member => member.id === id) ? [ groupMembers.find(member => member.id === id)?.picture as string ]
         : ['Unknown'];
  }
  // const convertMembersName = (ids: string[]): string => ids.map(id => convertMemberName(id)).join(', ');
  const convertMemberIcons = (ids: string[]): string[] => (ids && ids.length > 0) ? ids.map(id => convertMemberIcon(id)[0]) : ids;
  const convertPayedCategoryName = (id: string): string => categories.find((cat: ICategory) => cat.id === id)?.name || 'Unknown';
  const convertBuyCategoryName = (id: string): string => categories.find((cat: ICategory) => cat.id === id)?.name || 'Unknown';
  const convertDatetime = (timestamp: number): string => new Date(timestamp).toISOString();
  const convertNumber = (val: number): string => '¥' + String(Number(val).toLocaleString());

  const isLoading = !isPageInitialized || configs.length < 1 || groupMembers.length < 1;
  const isShownTable = getDisplayDataList(selectedType as IConfigType).length > 0;
  const isPay = selectedType === 'pay';

  if (isLoading) {
    return (<FadeWrapper><Progress /></FadeWrapper>);
  }

  return (
    <>
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
            <>
              {
                isPay && (
                  <div>
                    {
                      getCalculations().filter(obj => !obj.hasReimbursement).map(obj => {
                        return (
                          <Chip
                            key={obj.id}
                            className={classes.chips}
                            avatar={<Avatar alt="who" src={obj.picture} />}
                            label={`${obj.name} が ${Math.floor(obj.diff).toLocaleString()}円 立替中🙇‍♂️`}
                            // deleteIcon={<ExpandMoreIcon style={{ color: 'gray' }}/>}
                            // onDelete={() => {console.log('click')}}
                          />)
                      })
                    }
                  </div>
                ) 
              }
            </>
            <>
              {
                !isShownTable && (
                  <div className={classes.messageBox}>
                    <Link href={Utils.makeUrl('/input', selectedType)}>Input</Link> からデータを追加してね
                  </div>
                )
              }
            </>
            <>
              {
                isShownTable &&
                <TableContainer className={classes.tableContainer} component={Paper}>
                  <Table stickyHeader className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        {
                          Object.keys(displayMap).map(key => <TableCell key={key}>{displayMap[key]}</TableCell>)
                        }
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <>
                        {
                          getDisplayDataList(selectedType as IConfigType).slice().reverse().map((row) => {
                            if (row.length < 1) {
                              return (<FadeWrapper><CircularProgressV1 /></FadeWrapper>)
                            }
                            return (
                              <TableRow key={row[0].dataId} hover selected onClick={onRowClickHandler} data-id={row[0].dataId}>
                                {
                                  Object.keys(displayMap).map(key => {
                                    const col = row.find(data => data.id === key);
                                    const value = col ? convertDisplayValue(col.id, col.value) : '';
                                    if (displayPictures.includes(col?.id as keyof IInputData)) {
                                      return (
                                          <TableCell key={key} align="left">
                                            <div className={classes.avatarBlock}>{
                                            (value as string[]).map((pic, index) => {
                                              return (
                                                  <Avatar key={index} src={pic} />
                                              );
                                            })}
                                            </div>
                                          </TableCell>
                                      )
                                    }
                                    return (
                                      <TableCell key={key} align="left">{value}</TableCell>
                                    );
                                  })
                                }
                              </TableRow>
                            );
                          })
                        }
                      </>
                    </TableBody>
                  </Table>
                </TableContainer>
              }
            </>
          </CardContent>
        </Card>
        <DialogV1 id={targetId} value={targetId} title="" open={isDeleteModalOpen} content={modalContent} onClose={onCloseHandler}/>
      </Box>
    </>
  );
}

// TODO: Should display detail of data
const modalContent = (
  <Grid item xs={12} md={6}>
    <div>
      <List>
        <ListItem>
          <ListItemText
            primary="削除しますか？"
          />
        </ListItem>
      </List>
    </div>
  </Grid>
);
