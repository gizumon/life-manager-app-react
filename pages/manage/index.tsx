import { Accordion, AccordionDetails, AccordionSummary, Typography,
         Divider, AccordionActions, Button, makeStyles, createStyles, Theme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useFirebase } from '../../hooks/useFirebase';
import { ICategory, IThemeSetting } from '../../interfaces/index';
import { InputDialogV1, IModalInputConfig, defaultConfig } from '../../components/InputDialogV1';
import ManageList from '../../components/ManageListV1';
import { useSelector } from 'react-redux';
import { StoreState } from '../../ducks/createStore';
import { FirebaseState } from '../../ducks/firebase/slice';
import * as _ from 'lodash';
import ThemeSetting from '../../components/ThemeSettingV1';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 'calc(100% - 20px)',
      margin: '10px 10px 66px 10px',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    icon: {
      verticalAlign: 'bottom',
      height: 20,
      width: 20,
    },
    details: {
      alignItems: 'center',
    },
    column33: {
      flexBasis: '33.33%',
    },
    column50: {
      flexBasis: '50%',
    },
    column80: {
      flexBasis: '80%',
    },
    column100: {
      flexBasis: '100%',
    },
    helper: {
      borderLeft: `2px solid ${theme.palette.divider}`,
      padding: theme.spacing(1, 2),
    },
    link: {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  }),
);

const categoryTypeList = [
  { type: 'pay', label: 'Pay' },
  { type: 'tobuy', label: 'ToBuy' }
];

export default function Manage() {
  const classes = useStyles();
  const { updateCustomCategories, updateCustomThemeSetting } = useFirebase();
  const { categories, groupTheme } = useSelector<StoreState, FirebaseState>(state => state.firebase);
  const [isOpenAddCategoryModal, setIsOpenAddCategoryModal] = useState<boolean>(false);
  const [addCategoryModalConfig, setAddCategoryModalConfig] = useState<IModalInputConfig>(defaultConfig);
  const [themeSetting, setThemeSetting] = useState<IThemeSetting>(groupTheme || {selectedTheme: 'default'});
  const [newCategories, setNewCategories] = useState<ICategory[]>(categories);
  const selectedGroupId = sessionStorage.getItem('gid') || '';

  useEffect(() => {
    if (categories.length > 0) {
      setNewCategories(categories);
    }
  }, [categories]);

  const onOpenAddCategory = (categoryType: string, id: string = '') => {
    const isUpdate = !!id;
    setAddCategoryModalConfig({
      id: id || `custom-category-${categoryType}-${String(newCategories.length)}`,
      label: 'カテゴリ名',
      type: 'text',
      value: newCategories.find(cat => cat.id === id)?.name || '',
      placeholder: 'カテゴリ名を入力してください',
      isRequired: true,
      args: [categoryType, isUpdate],
    });
    setIsOpenAddCategoryModal(true);
  }

  const onCloseAddCategoryModal = (configs?: IModalInputConfig[]) => {
    if (configs && configs.length === 1) {
      const config = configs[0];
      setNewCategories((states) => {
        const isUpdate = config.args?.[1] || false;
        const updateStates = _.cloneDeep(states);
        if (isUpdate) {
          updateStates.forEach(state => {
            if (state.id === config.id) {
              state.name = config.value;
            }
          });
        } else {
          updateStates.push({
            id: config.id,
            name: config.value,
            type: config.args?.[0] || '',
            isHide: false,
            setting: {
              order: updateStates.filter(state => state.type === config.args?.[0]).length,
            }
          } as ICategory);
        }
        updateCustomCategories && updateCustomCategories(selectedGroupId, updateStates);
        return [...updateStates];
      })
    }
    setIsOpenAddCategoryModal(false);
  } 

  return (
    <>
      <div className={classes.root}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1c-content"
            id="panel1c-header"
          >
            <div className={classes.column33}>
              <Typography className={classes.heading}>テーマ設定</Typography>
            </div>
            <div className={classes.column50}>
              <Typography className={classes.secondaryHeading}>Theme setting</Typography>
            </div>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <div className={classes.column100}>
              <ThemeSetting setting={themeSetting} setSetting={setThemeSetting} />
            </div>
          </AccordionDetails>
          <AccordionActions>
            <Button size="small" color="primary" onClick={() => updateCustomThemeSetting && updateCustomThemeSetting(selectedGroupId, themeSetting)}>
              Save
            </Button>
        </AccordionActions>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1c-content"
            id="panel1c-header"
          >
            <div className={classes.column33}>
              <Typography className={classes.heading}>カテゴリ管理</Typography>
            </div>
            <div className={classes.column50}>
              <Typography className={classes.secondaryHeading}>Manage category data</Typography>
            </div>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <div className={classes.column100}>
                {
                  categoryTypeList.map((categoryType) => {
                    return (
                      <div key={categoryType.type}>
                        <ManageList
                          listType={categoryType}
                          dataList={newCategories}
                          setDataList={setNewCategories}
                          onClickUpsertBtn={(id?: string) => onOpenAddCategory(categoryType.type, id)}
                          onUpdated={(data: ICategory[]) => updateCustomCategories && updateCustomCategories(selectedGroupId, data)}
                        />
                        <Divider />
                      </div>
                    )
                  })
                }
            </div>
          </AccordionDetails>
        </Accordion>
        <InputDialogV1 configs={[addCategoryModalConfig]} isOpen={isOpenAddCategoryModal} onClose={onCloseAddCategoryModal}/>
      </div>
    </>
  );
}
