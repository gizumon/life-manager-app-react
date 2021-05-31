import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { IInput } from '../interfaces';
import { Button, ButtonGroup } from '@material-ui/core';

type IProps = {
    config: IInput;
    model: String;
}

// TODO: Need to fix the layout when there are over 4 items cases
const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      margin: 0,
      width: '100%',
    },
    btn: {
      flex: 1,
      flexGrow: 1,
      borderRadius: '0px 0px 0px 4px',
      fontWeight: 700,
      height: '3rem',
      padding: '6px 4px',
    //   backgroundColor: theme.palette.secondary.main,
    },
  }),
);

export default function SelectBtnsV1({config, model}: IProps) {
    const classes = useStyles();
    // const [item, setItem] = React.useState(model);
  
    // const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    //   setItem(event.target.value as string);
    // };
  
    return (
        <ButtonGroup className={classes.root} variant="contained" color="secondary" aria-label="select-btns">
        {
            config.dataList?.map((data) => {
                return (
                    <Button
                        value={data.id}
                        key={data.id}
                        className={classes.btn + ' ellipsis'}
                        onClick={(test) => {console.log('!!!ON CLICK:', test)}}
                    >{data.name}</Button>
                );
            })
        }
        </ButtonGroup>
    );
  }
