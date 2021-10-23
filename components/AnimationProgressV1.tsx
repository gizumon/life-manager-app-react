import React from 'react';
import Image from 'next/image';
import {createStyles, Theme} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      'flex': 1,
      'display': 'flex',
      'flexDirection': 'column',
      'justifyContent': 'center',
      'alignItems': 'center',
      'width': '100vw',
      'height': 'calc(100vh - 2rem)',
      '& img': {
        maxWidth: '40%',
        maxHeight: '100%',
      },
    },
    message: {
      height: '2rem',
      fontWeight: 600,
      fontFamily: 'Georgia',
      color: 'darkgrey',
      marginTop: '-15px',
    },
  }),
);

type IProps = {
  imgUrl?: string;
  message?: string;
}

export default function Progress(props: IProps) {
  console.log('Child component', props);
  const classes = useStyles();

  return (
    <div className={classes.root} >
      {
        <Image src={props.imgUrl ? props.imgUrl : './loading.gif'} alt='Loading...'/>
      }
      {
        <p className={classes.message}>{props.message ? props.message : 'Loading...'}</p>
      }
    </div>
  );
}

