import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IInput } from '../interfaces';
import { Button, ButtonGroup } from '@material-ui/core';
import { useToggle } from '../hooks/useToggle';
import { useUpdateEffect } from '../hooks/useUpdateEffect';

type IProps = {
    config: IInput;
    setProps: React.Dispatch<React.SetStateAction<any>>;
    onClick: {
      (): void;
    };
}

// TODO: Need to fix the layout when there are over 4 btns cases
const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexFlow: 'column',
      margin: 0,
      width: '100%',
    },
    btnsGroup: {
      margin: 0,
      width: '100%',
      borderTop: '1px solid rgb(17, 93, 86)',
      '&> .MuiButton-root': {
        borderRadius: '0px 0px 0px 0px',
      },
      '&:first-child': {
        borderRadius: '0px 0px 0px 0px',
      },
      '&:last-child': {
        borderRadius: '0px 0px 0px 4px',
      }
    },
    btn: {
      flex: 1,
      flexGrow: 1,
      fontWeight: 700,
      height: '3rem',
      padding: '6px 4px',
    //   backgroundColor: theme.palette.secondary.main,
    },
  }),
);

// TODO: Need to control onClick values
export default function SelectBtnsV1({config, setProps, onClick}: IProps) {
  const defaultMaxNumOfBtnInRow = 3;
  const classes = useStyles();
  const [isClick, setToggle] = useToggle();
  const dataList = config.dataList || [];
  const maxNumberOfBtnInRow = config.args && config.args[0] && typeof config.args[0]['maxNumberOfBtnInRow'] === 'number'
                            ? config.args[0]['maxNumberOfBtnInRow'] : defaultMaxNumOfBtnInRow;
  // const numOfRows = Math.floor((config.dataList?.length || 0) / maxNumberOfBtnInRow) + 1;

  const btnsRows = [];
  for (let i=0; i <= dataList.length; i = i + maxNumberOfBtnInRow) {
    const lastIndex = (i + maxNumberOfBtnInRow) > dataList.length ? dataList.length : i + maxNumberOfBtnInRow;
    btnsRows.push(dataList.slice(i, lastIndex));
  }

  const onClickHandler = (id: string = '') => {
    return () => {
      setProps((prevVal: any, ) => {
        return {...prevVal, [config.id]: id}
      });
      setToggle();
    };
  };

  useUpdateEffect(() => {
    // skip initial render behavior
    onClick();
  }, [isClick]);

  return (
    <div className={classes.root}>
      {
        btnsRows.map((btns, index) => {
          return (
            <ButtonGroup key={index} className={classes.btnsGroup} variant="contained" color="secondary" aria-label="select-btns">
              {
                btns.map((btn) => {
                  return (
                    <Button
                      value={btn.id}
                      key={btn.id}
                      className={classes.btn + ' ellipsis'}
                      onClick={onClickHandler(btn.id)}
                    >{btn.name}</Button>
                  );
                })
              }
            </ButtonGroup>
          )
        })
      }
    </div>
  );
}
