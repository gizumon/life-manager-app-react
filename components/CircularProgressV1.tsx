import React from 'react';
import { CircularProgress, createStyles, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: 200,
    },
  }),
);

type IProps = {
    id?: string;
    state?: number;
    onClick?: (val: any) => any | void;
}

export default function CircularProgressV1(props: IProps) {
    console.log('Child component', props);
    const classes = useStyles();
    return (
        <div className={classes.root} >
          <CircularProgress />
        </div>
    );
}

