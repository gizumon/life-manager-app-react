import { Accordion, AccordionDetails, AccordionSummary, Typography,
         Divider, AccordionActions, Button, makeStyles, createStyles, Theme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useFirebase } from '../../hooks/useFirebase';
import { ICategory } from '../../interfaces/index';
import { InputDialogV1, IModalInputConfig, defaultConfig } from '../../components/InputDialogV1';
import ManageList from '../../components/ManageListV1';

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
  const { activateGroup, isInitialized, categories, updateCustomCategories } = useFirebase();
  const [isOpenAddCategoryModal, setIsOpenAddCategoryModal] = useState<boolean>(false);
  const [addCategoryModalConfig, setAddCategoryModalConfig] = useState<IModalInputConfig>(defaultConfig);
  const [newCategories, setNewCategories] = useState<ICategory[]>(categories);
  const selectedGroupId = sessionStorage.getItem('gid') || '';

  useEffect(() => { (selectedGroupId && activateGroup) ? activateGroup(selectedGroupId) : undefined }, [isInitialized]);

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
        if (isUpdate) {
          states.forEach(state => {
            if (state.id === config.id) {
              state.name = config.value;
            }
          });
        } else {
          states.push({
            id: config.id,
            name: config.value,
            type: config.args?.[0] || '',
            isHide: false,
            setting: {
              order: states.filter(state => state.type === config.args?.[0]).length,
            }
          } as ICategory)
        }
        updateCustomCategories(selectedGroupId, states);
        return [...states];
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
                      <ManageList
                        key={categoryType.type}
                        listType={categoryType}
                        dataList={newCategories}
                        setDataList={setNewCategories}
                        onClickUpsertBtn={(id?: string) => onOpenAddCategory(categoryType.type, id)}
                        onUpdated={(data: ICategory[]) => updateCustomCategories(selectedGroupId, data)}
                      />
                    )
                  })
                }
            </div>
          </AccordionDetails>
          <Divider />
          <AccordionActions>
            <Button size="small">Cancel</Button>
            <Button size="small" color="primary">
              Save
            </Button>
          </AccordionActions>
        </Accordion>
        <InputDialogV1 configs={[addCategoryModalConfig]} isOpen={isOpenAddCategoryModal} onClose={onCloseAddCategoryModal}/>
      </div>
    </>
  );
}
