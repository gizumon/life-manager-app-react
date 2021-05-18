import React from 'react';
import { useRouter } from 'next/router';
// import '../../styles/globals.css';
// import '../styles/react.css';  // ./src/App.css
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import PaymentIcon from '@material-ui/icons/Payment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';

import InputV1 from '../../components/InputV1';
import SelectV1 from '../../components/SelectV1';
import MultiCheckV1 from '../../components/MultiCheckV1';
import { IConfig, IPageConfig } from '../../interfaces';
import CONST from '../../services/CONST';

type ITabIndex = 0 | 1 | 2;
type IInputType = 'pay' | 'todo' | 'tobuy';
interface ITabMap {
  toType: {
    [key in ITabIndex]: IInputType
  },
  toIndex: {
    [key in IInputType]: ITabIndex
  }
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
  }
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
    card: {
      minWidth: 300,
      maxWidth: 450,
      margin: '25px'
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
  }),
);

// TODO: replace 
const members = [
  {
    id: '1',
    line_id: 'dummy_1_lineId',
    name: 'だみー君',
    picture: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
  },
  {
    id: '2',
    line_id: 'dummy_2_lineId',
    name: 'てすとちゃん',
    picture: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
  },
];

const configs: IConfig[] = [
  {
    type: 'pay',
    name: 'pay',
    icon: 'mdi-account-cash',
    description: 'お会計を追加してね',
    inputs: [
      {
        id: 'price',
        name: '金額',
        type: 'number',
        placeholder: 'ex) 2,000',
        icon: 'mdi-cash-100',
        model: null,
        validates: [
          {
            type: 'isNotNull',
          },
          {
            type: 'isLower',
            args: [10],
          },
        ],
      },
      {
        id: 'payedFor',
        name: '誰の',
        type: 'multi-check',
        placeholder: '-- だれの --',
        icon: 'mdi-account-circle',
        model: members || [], // TODO: mounted default person
        validates: [
          {
            type: 'isNotNull',
          },
        ],
        dataList: members || [],
      },
      {
        id: 'category',
        name: 'カテゴリ',
        type: 'select-btns',
        placeholder: '-- カテゴリ --',
        icon: 'mdi-help-box',
        model: 'none',
        validates: [],
        dataList: CONST.category,
      },
      {
        id: 'memo',
        name: '備考',
        type: 'text',
        placeholder: 'ex) コンビニ',
        icon: 'mdi-tooltip-edit',
        model: null,
        validates: [],
        args: [],
      },
      {
        id: 'payedBy',
        name: '支払ってくれた人',
        type: 'select-btns',
        placeholder: '',
        icon: 'mdi-account-circle',
        model: '',
        validates: [],
        args: [],
        dataList: members || [],
      },
    ],
  },
  {
    type: 'todo',
    name: 'todo',
    icon: 'mdi-calendar-check',
    description: 'ToDoを追加してね',
    inputs: [
      {
        id: 'task',
        name: 'タスク',
        type: 'text',
        placeholder: 'ex) ごみ捨て',
        icon: 'mdi-checkbox-marked',
        model: '',
        validates: [
          {
            type: 'iNotNull',
          },
          {
            type: 'isLower',
            args: [100],
          },
        ],
        args: [],
      },
      {
        id: 'dueDate',
        name: '期限',
        type: 'date',
        placeholder: '2021/XX/XX',
        icon: 'mdi-calendar-clock',
        model: new Date(), // TODO: mounted default person
        validates: [
          {
            type: 'isDate',
          },
        ],
        args: [],
      },
      {
        id: 'doBy',
        name: '担当',
        type: 'select-btns',
        placeholder: '',
        icon: 'mdi-account-circle',
        model: '',
        validates: [],
        args: [],
        dataList: members || [],
      },
    ],
  },
  {
    type: 'tobuy',
    name: 'tobuy',
    icon: 'mdi-cart-plus',
    description: '買う物リストを追加してね',
    inputs: [
      {
        id: 'task',
        name: 'タスク',
        type: 'text',
        placeholder: 'ex) しめじ',
        icon: 'mdi-checkbox-marked',
        model: '',
        validates: [
          {
            type: 'iNotNull',
          },
          {
            type: 'isLower',
            args: [100],
          },
        ],
        args: [],
      },
      {
        id: 'dueDate',
        name: '期限',
        type: 'date',
        placeholder: '2021/XX/XX',
        icon: 'mdi-calendar-clock',
        model: new Date(), // TODO: mounted default person
        validates: [
          {
            type: 'isDate',
          },
        ],
        args: [],
      },
      {
        id: 'doBy',
        name: '担当',
        type: 'select-person-btn',
        placeholder: '',
        icon: 'mdi-account-circle',
        model: '',
        validates: [],
        args: [],
      },
    ]
  },
];

let selectedConfig: IConfig;
let id: string | undefined;
let type: IInputType | undefined;

function getTabProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const Input = () => {
  const router = useRouter();
  id = router.query.id as string | undefined;
  type = router.query.type as IInputType | undefined;
  const pageConfig: IPageConfig = {
    valid: false,
    selectedId: id,
    selectedType: type,
    configs: configs,
  };
  console.log(pageConfig);
  selectedConfig = pageConfig.configs.find((config) => config.type === type) || configs[tabMap.toIndex['pay']];

  const classes = useStyles();
  const [tabIndex, setValue] = React.useState(type === undefined ? 0 : tabMap.toIndex[type] as ITabIndex);

  const handleChange = (_: React.ChangeEvent<{}>, newValue: ITabIndex) => {
    setValue(newValue);
    selectedConfig = pageConfig.configs.find((config) => config.type === tabMap.toType[newValue]) || configs[tabMap.toIndex['pay']];
    console.log('change detected!!: ', newValue, selectedConfig);
  };

  console.log('request type: ', type, selectedConfig);
  return (
    <div style={{ width: '100%' }}>
      <Box display="flex" justifyContent="center">
        <Card className={classes.card}>
          <Tabs
            variant="fullWidth"
            value={tabIndex}
            onChange={handleChange}
            aria-label="nav tabs"
          >
            <Tab label={<><PaymentIcon /> Pay</>} {...getTabProps(tabMap.toIndex['pay'])} />
            <Tab label={<><AssignmentTurnedInIcon /> ToDo</>} {...getTabProps(tabMap.toIndex['todo'])} />
            <Tab label={<><AddShoppingCartIcon /> ToBuy</>} {...getTabProps(tabMap.toIndex['tobuy'])} />
          </Tabs>
          {/* <TabPanel value={value} index={0}></TabPanel>
          <TabPanel value={value} index={1}></TabPanel>
          <TabPanel value={value} index={2}></TabPanel> */}
          <CardContent>
              {
                selectedConfig.inputs.map((input) => {
                  console.log('loop in inputs', input);
                  if (input.type === 'number' || input.type === 'text') {
                    return (<InputV1 key={input.id} config={input} model={input.model}></InputV1>);
                  } else if (input.type === 'select-btns') {
                    return (<SelectV1 key={input.id} config={input} model={input.model}></SelectV1>);
                  } else if (input.type === 'multi-check') {
                    return (<MultiCheckV1 key={input.id} config={input} model={input.model}></MultiCheckV1>);
                  } else {
                    console.warn('Unknown type is detected in configs', input);
                    return (<div>TBD</div>)              }
                })
              }
            </CardContent>
          <CardActions disableSpacing>
            {/* <IconButton aria-label="share">
              <ShareIcon />
            </IconButton> */}
          </CardActions>
        </Card>
      </Box>
    </div>
  );
}

export default Input;
