import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Link, Grid, List, ListItem, ListItemText, Divider} from '@material-ui/core';
import {Card, CardContent, Tabs, Tab, Box, Chip} from '@material-ui/core';
import PaymentIcon from '@material-ui/icons/Payment';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import {IConfigType, IInputData, IInput, IConfig} from '../../interfaces';
import {useRouter} from 'next/router';
import Utils from '../../services/utils';
import {useFirebase} from '../../hooks/useFirebase';
import {ICategory} from '../../interfaces/index';
import FadeWrapper from '../../components/common/FadeWrapper';
import Progress from '../../components/common/AnimationProgressV1';
import CircularProgressV1 from '../../components/common/CircularProgressV1';
import {DialogV1} from '../../components/common/DialogV1';
import SearchBox from '../../components/list/SearchBoxV1';
import {useSelector} from 'react-redux';
import {StoreState} from '../../ducks/createStore';
import {FirebaseState} from '../../ducks/firebase/slice';
import IconButton from '@material-ui/core/IconButton';

interface ICalculation {
  id: string;
  name: string;
  picture: string;
  shouldReceive: number;
  shouldPay: number;
  diff: number;
  hasReimbursement: Boolean;
}

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
};

const useStyles = makeStyles((theme) => ({
  card: {
    'width': 350,
    'margin': '25px 0px 65px 0px',
    '& .MuiTab-root': {
      padding: '8px 12px',
    },
  },
  tableContainer: {
    maxHeight: 320,
  },
  table: {
    'minWidth': 300,
    'whiteSpace': 'nowrap',
    '&> thead > tr > th': {
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      fontWeight: 700,
      padding: '6px 10px',
    },
    '&> tbody > tr > td': {
      maxWidth: '40vw',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
  },
  avatarBlock: {
    'display': 'flex',
    '& .MuiAvatar-circular': {
      width: 20,
      height: 20,
    },
  },
  chips: {
    marginBottom: '5px',
    fontWeight: 700,
    color: '#fff',
    backgroundColor: theme.palette.error.main,
    opacity: 0.9,
  },
  messageBox: {
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'padding': 20,
    'borderTop': 'solid 5px #000',
    'borderColor': theme.palette.warning.main,
    'fontSize': '1rem',
    'fontWeight': 700,
    'boxShadow': '0 3px 5px rgb(0 0 0 / 22%)',
    '&> a': {
      marginRight: '7px',
      fontSize: '1.2rem',
      fontWeight: 900,
    },
  },
  dialog: {
    '& .MuiListItem-root': {
      '& span': {
        overflowX: 'scroll',
        whiteSpace: 'nowrap',
      },
    },
    '& .MuiDivider-vertical': {
      height: '16px',
    },
  },
  graphIcon: {
    display: 'flex',
    float: 'right',
    width: '30px',
    height: '30px',
    alignContent: 'center',
    justifyContent: 'center',
    '& .MuiIconButton-root': {
      padding: 0,
    },
  },
}));

const displayPictures: (keyof IInputData)[] = [
  'payedFor', 'payedBy', 'buyBy', 'doBy',
];

function getTabProps(index: number) {
  return {
    'id': `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function ListPage() {
  const classes = useStyles();
  const router = useRouter();
  const {configs, inputs, groupMembers, categories} = useSelector<StoreState, FirebaseState>((state) => state.firebase);
  const {activateGroup, deleteInput} = useFirebase();

  const selectedId = sessionStorage.getItem('gid') || '';
  const selectedType = router.query['type'] as string || Utils.getQueryParam(router.asPath, 'type') || 'pay';

  const [tabIndex, setTabIndex] = React.useState<ITabIndex>(tabMap.toIndex[selectedType as IConfigType] || tabMap.toIndex['pay']);
  const [isPageInitialized, setIsPageInitialized] = React.useState<boolean>(false);
  const [displayMap, setDisplayMap] = React.useState<IDisplayMap>({});
  const [displayDataObj, setDisplayDataObj] = React.useState<IDisplayDataObject>({pay: [], todo: [], tobuy: []});
  const [targetId, setTargetId] = React.useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState<boolean>(false);
  const [searchKey, setSearchKey] = React.useState<string>('');

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
        const order1 = inputConfigs.find((input) => input.id === key1[0])?.order || 100;
        const order2 = inputConfigs.find((input) => input.id === key2[0])?.order || 100;
        return order1 < order2 ? -1 : order1 > order2 ? 1 : 0;
      });
      setDisplayMap(sortedMap);

      const dataObj: IDisplayDataObject = {pay: [], todo: [], tobuy: []};
      Object.keys(inputs).forEach((type) => {
        inputs[type as IConfigType].forEach((data) => {
          const list: IDisplayData[] = [];
          Object.keys(data).forEach((key) => {
            const isValid = !!sortedMap[key];
            if (isValid) {
              list.push({
                id: key,
                dataId: data.id,
                name: sortedMap[key],
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
    setTargetId(e.currentTarget.getAttribute('data-id') || '');
    setIsDeleteModalOpen(true);
  };

  const getConfig = (type: IConfigType): IConfig => {
    return configs[tabMap.toIndex[type]];
  };

  const getDisplayDataList = (type: IConfigType): IDisplayData[][] => {
    return (displayDataObj && displayDataObj[type]) ? displayDataObj[type] : [];
  };

  // calculate the amount payed for someone
  const getCalculations = (): ICalculation[] => {
    const arr: ICalculation[] = [];
    groupMembers.forEach((member) => {
      const calcObj = {
        id: member.id || '',
        name: member.name,
        picture: member.picture || '',
        shouldReceive: 0,
        shouldPay: 0,
        diff: 0,
        hasReimbursement: false,
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

  const getMemberName = (memberId: string): string => {
    return groupMembers.find((member) => member.id === memberId)?.name || '';
  };

  const isRowDisplay = (row: IDisplayData[] = []) => {
    return row.some((col) => {
      const value = convertDisplayValue(col.id, col.value);
      if (typeof value === 'string') {
        return Utils.hasString(value, searchKey);
      }
      if (Array.isArray(col.value)) {
        return col.value.some((memberId) => Utils.hasString(getMemberName(memberId), searchKey));
      }
      return Utils.hasString(getMemberName(String(col.value)), searchKey);
    });
  };

  const rowSortHandler = (row1: IDisplayData[], row2: IDisplayData[]): number => {
    let result = 0;
    const orderFuncMap = {
      asc: (arg1: string | number, arg2: string | number) => Utils.asc(arg1, arg2),
      desc: (arg1: string | number, arg2: string | number) => Utils.desc(arg1, arg2),
      custom: (arg1: number, arg2: number) => (arg1 - arg2),
    };

    const orders = [ ...getConfig(selectedType as IConfigType).setting.order ];
    // orders.sort((o1, o2) => o1.id - o2.id);

    for (const order of orders) {
      if (order.id === 'datetime') {
        result = 0;
      } else {
        if (order.type === 'custom') {
          const id1 = row1.find((col) => col.id === order.id)?.value;
          const id2 = row2.find((col) => col.id === order.id)?.value;
          const arg1 = categories.find((category) => category.id === id1).setting.order;
          const arg2 = categories.find((category) => category.id === id2).setting.order;
          result = orderFuncMap[order.type](arg1, arg2);
        } else {
          const arg1 = row1.find((col) => col.id === order.id)?.value;
          const arg2 = row2.find((col) => col.id === order.id)?.value;
          result = orderFuncMap[order.type](arg1, arg2);
        }
      }
      if (result !== 0) break;
    }
    return result;
  };

  const onClickGraphIcon = () => router.push(Utils.makeUrl('/list/graph', selectedType), undefined, { shallow: true });

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
    return id === 'ALL' ? ['全員'] :
         groupMembers.find((member) => member.id === id) ? [groupMembers.find((member) => member.id === id)?.picture as string] :
         ['Unknown'];
  };
  // const convertMembersName = (ids: string[]): string => ids.map(id => convertMemberName(id)).join(', ');
  const convertMemberIcons = (ids: string[]): string[] => (ids && ids.length > 0) ? ids.map((id) => convertMemberIcon(id)[0]) : ids;
  const convertPayedCategoryName = (id: string): string => categories.find((cat: ICategory) => cat.id === id)?.name || 'Unknown';
  const convertBuyCategoryName = (id: string): string => categories.find((cat: ICategory) => cat.id === id)?.name || 'Unknown';
  const convertDatetime = (timestamp: number): string => new Date(timestamp).toISOString();
  const convertNumber = (val: number): string => '¥' + String(Number(val).toLocaleString());

  const modalContent = (dataList: IDisplayData[]) => {
    return (
      <div className={classes.dialog}>
        <List dense>
          <Grid item xs={12} md={6}>
            {
              dataList.map((data) => {
                const value = convertDisplayValue(data.id, data.value);
                return (
                  <ListItem key={data.id}>
                    <Grid item xs={3} md={1}>
                      <ListItemText primary={data.name} />
                    </Grid>
                    <Grid item xs={1} md={1}>
                      <Divider orientation="vertical" />
                    </Grid>
                    <Grid item xs={8} md={4}>
                      <ListItemText
                        primary={
                          Array.isArray(value) ? (
                            <div className={classes.avatarBlock}>
                              {
                                value.map((pic, index) => <Avatar key={index} src={pic} />)
                              }
                            </div>
                          ) : value
                        }
                      />
                    </Grid>
                  </ListItem>
                );
              })
            }
          </Grid>
        </List>
      </div>
    );
  };

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
            indicatorColor="primary"
          >
            <Tab label={<><PaymentIcon /> Pay</>} {...getTabProps(tabMap.toIndex['pay'])} />
            <Tab label={<><AssignmentTurnedInIcon /> ToDo</>} {...getTabProps(tabMap.toIndex['todo'])} />
            <Tab label={<><AddShoppingCartIcon /> ToBuy</>} {...getTabProps(tabMap.toIndex['tobuy'])} />
          </Tabs>
          <CardContent>
            <div className={classes.graphIcon}>
              <IconButton aria-label="graph" onClick={onClickGraphIcon}>
                <EqualizerIcon />
              </IconButton>
            </div>
            <div>
              <SearchBox value={searchKey} setValue={setSearchKey} />
            </div>
            <>
              {
                isPay && (
                  <div>
                    {
                      getCalculations().filter((obj) => !obj.hasReimbursement).map((obj) => {
                        return (
                          <Chip
                            key={obj.id}
                            className={classes.chips}
                            avatar={<Avatar alt="who" src={obj.picture} />}
                            label={`${obj.name} が ${Math.floor(obj.diff).toLocaleString()}円 立替中🙇‍♂️`}
                            // deleteIcon={<ExpandMoreIcon style={{ color: 'gray' }}/>}
                            // onDelete={() => {console.log('click')}}
                          />);
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
                          Object.keys(displayMap).map((key) => <TableCell key={key}>{displayMap[key]}</TableCell>)
                        }
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <>
                        {
                          getDisplayDataList(selectedType as IConfigType)
                              .slice().reverse()
                              .filter((row) => isRowDisplay(row))
                              .sort((row1, row2) => rowSortHandler(row1, row2))
                              .map((row) => {
                                if (row.length < 1) {
                                  return (<FadeWrapper><CircularProgressV1 /></FadeWrapper>);
                                }
                                return (
                                  <TableRow key={row[0].dataId} hover onClick={onRowClickHandler} data-id={row[0].dataId}>
                                    {
                                      Object.keys(displayMap).map((key) => {
                                        const col = row.find((data) => data.id === key);
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
                                          );
                                        }
                                        return (
                                          <TableCell key={key} align="left">{value}</TableCell>
                                        );
                                      })
                                    }
                                  </TableRow>
                                );
                              },
                              )
                        }
                      </>
                    </TableBody>
                  </Table>
                </TableContainer>
              }
            </>
          </CardContent>
        </Card>
        <DialogV1
          id={targetId}
          value={targetId}
          title="Remove?"
          open={isDeleteModalOpen}
          content={
            modalContent(getDisplayDataList(selectedType as IConfigType)?.find((row) => row[0]?.dataId === targetId) || [])
          }
          onClose={onCloseHandler}/>
      </Box>
    </>
  );
}
