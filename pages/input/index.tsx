import React, { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import createTrigger from "react-use-trigger";

import { Card, CardContent, CardActions, Tabs, Tab, Box } from '@material-ui/core';
import PaymentIcon from '@material-ui/icons/Payment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';

import { IConfig, IConfigType, IFormData } from '../../interfaces';
import InputV1 from '../../components/InputV1';
import SelectV1 from '../../components/SelectV1';
import MultiCheckV1 from '../../components/MultiCheckV1';
import DateV1 from '../../components/DateV1';
import SelectBtnsV1 from '../../components/SelectBtnsV1';
import ModalV1 from '../../components/ModalV1';
import { ValidationService } from '../../services/validationService';
import Utils from '../../services/utilsService';
import { useFirebase } from '../../hooks/useFirebase';
import FadeWrapper from '../../components/FadeWrapper';
import Progress from '../../components/AnimationProgressV1';
// import { useUserState } from '../../ducks/user/selector';
// import { useAuth } from '../../hooks/useAuthLiff';

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
type IValidMap = {
  [key in IConfigType]?: string[]
};
type IValidatorMap = {
  [key in IConfigType]?: ValidationService;
}

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

const validMap: IValidMap = {};
const validatorMap: IValidatorMap = {};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
    card: {
      minWidth: 300,
      maxWidth: 450,
      margin: '25px 25px 65px 25px',
    },
    btns: {
      padding: '0px',
    },
  }),
);

function getTabProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function Input() {
  const classes = useStyles();
  const router = useRouter();
  // const user = useUserState().user;
  // console.log('!!!!user :', user);
  const { configs, pushInput, activateGroup, isInitialized } = useFirebase();

  const selectedId = sessionStorage.getItem('gid') || '';
  const selectedType = router.query['type'] as string || Utils.getQueryParam(router.asPath, 'type');

  const [tabIndex, setTabIndex] = React.useState<ITabIndex>(tabMap.toIndex[selectedType as IConfigType] || tabMap.toIndex['pay']);
  console.log('default tab index: ', tabIndex);
  // const [selectedConfig, setSelectedConfig] = React.useState<IConfig>();
  const [formData, setFormData] = React.useState<IFormData>({});
  const [isOpenSuccessModal, setIsOpenSuccessModal] = React.useState<boolean>(false);
  const [isOpenErrorModal, setIsOpenErrorModal] = React.useState<boolean>(false);
  const [modalBody, setModalBody] = React.useState<{[key in string]: string}>({success: '', error: ''});
  const [isPageInitialized, setIsPageInitialized] = React.useState<boolean>(false);
  const onClickTrigger = createTrigger();

  const getConfig = (type: IConfigType): IConfig => configs[tabMap.toIndex[type]] || null;

  const onTabChange = useCallback((_: React.ChangeEvent<{}>, index: ITabIndex) => {
    setTabIndex(index);
    router.push(`/input?type=${tabMap.toType[index]}`, undefined, {shallow: true});
  }, []);

  const processData = (data: IFormData = {}): IFormData => {
    let processedData: IFormData = {};
    validMap[selectedType as IConfigType]?.forEach((id) => {
      if (data.hasOwnProperty(id)) {
        processedData[id] = typeof data[id] === 'undefined' ? "" : data[id];
      }
    });
    return processedData;
  };

  const makeDefaultFormData = (list: IConfig[]): IFormData => {
    const data: IFormData = {};
    list.forEach(config => config.inputs.forEach((input) => data[input.id] = input.model));
    return data;
  };

  const isValidConfigType = (type: string) => {
    return Object.keys(tabMap.toIndex).map((key) => key).includes(type);
  };

  const onSuccessModalClose = useCallback(() => {
      setIsOpenSuccessModal(false);
      setModalBody({success: '', error: ''});
      setFormData(makeDefaultFormData(configs));
  }, [configs]);

  const onErrorModalClose = useCallback(() => {
      setIsOpenErrorModal(false);
      setModalBody({success: '', error: ''});
  }, []);

  // onClick submit button
  onClickTrigger.subscribe(() => {
    const reqData = processData(formData);
    const validator = validatorMap[selectedType as IConfigType] as ValidationService;
    if (!selectedType || !isValidConfigType(selectedType) || !validator) {
      console.warn('selected id, type is invalid: ', selectedType, isValidConfigType(selectedType), validator);
      setModalBody({error: '更新に失敗しました'});
      setIsOpenErrorModal(true);
      return;
    }
    const [isValid, errMsg] = validator.validate(reqData);
    if (isValid && pushInput) {
      pushInput(selectedId, selectedType as IConfigType, reqData).then(() => {
        setModalBody({success: `「${tabMap.toName[selectedType as IConfigType]}」が登録されました`});
        setIsOpenSuccessModal(true);
        // liff?.sendMessages([
        //   {
        //     type: 'text',
        //     text: `「${tabMap.toName[selectedType as IConfigType]}」が登録されました`
        //   }
        // ]);
      });
    } else if (!isValid) {
      setModalBody({error: errMsg || '更新に失敗しました (エラー文言の生成に失敗)'});
      console.log('Invalid req data: ', formData, reqData, errMsg);
      setIsOpenErrorModal(true);
    } else {
      console.warn('unknown error', selectedId, selectedType);
    }
  });

  useEffect(() => {
    if (configs.length > 0) {
      Object.keys(tabMap.toIndex).forEach((type: string) => validMap[type as IConfigType] = getConfig(type as IConfigType).inputs.map(input => input.id));
      Object.keys(tabMap.toIndex).forEach((type: string) => validatorMap[type as IConfigType] = new ValidationService(getConfig(type as IConfigType)));
      setFormData(makeDefaultFormData(configs));
      setIsPageInitialized(true);
    }
  }, [configs]);

  useEffect(() => {
    if (activateGroup) {
      activateGroup(selectedId);
    }
  }, [isInitialized]);

  const isLoading = !configs || configs.length === 0 || !isPageInitialized;

  if (isLoading) {
    return (
      <FadeWrapper>
        <Progress />
      </FadeWrapper>
    );
  }

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
            {
              getConfig(selectedType as IConfigType)?.inputs.map((input) => {
                if (input.type === 'text') {
                  return (<InputV1 key={input.id} config={input} model={formData[input.id]} setProps={setFormData} />);
                } else if (input.type === 'number') {
                  return (<InputV1 key={input.id} config={input} model={formData[input.id]} setProps={setFormData} type="number" />);
                } else if (input.type === 'select') {
                  return (<SelectV1 key={input.id} config={input} model={formData[input.id]} setProps={setFormData} />);
                } else if (input.type === 'multi-check') {
                  return (<MultiCheckV1 key={input.id} config={input} model={formData[input.id]} setProps={setFormData} />);
                } else if (input.type === 'date') {
                  return (<DateV1 key={input.id} config={input} model={formData[input.id]} setProps={setFormData} />);
                }
              })
            }
        </CardContent>
        <CardActions disableSpacing className={classes.btns}>
          {
            getConfig(selectedType as IConfigType)?.inputs.map((input) => {
              if (input.type === 'select-btns') {
                return (<SelectBtnsV1 key={input.id} config={input} setProps={setFormData} onClick={onClickTrigger} />);
              }
            })
          }
        </CardActions>
      </Card>
      <ModalV1 open={isOpenSuccessModal} title='Success!' body={modalBody['success']} onClose={onSuccessModalClose} />
      <ModalV1 open={isOpenErrorModal} title='Error!' body={modalBody['error']} onClose={onErrorModalClose} />
    </Box>
  );
}
