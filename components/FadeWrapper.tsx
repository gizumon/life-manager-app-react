import React, {useState, useEffect} from 'react';
import {createStyles, Theme} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {Transition, TransitionStatus} from 'react-transition-group';

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      opacity: 0,
    },
  }),
);

const transitionStyles: {[key in TransitionStatus] : any} = {
  entering: {opacity: 1, transition: 'all 1s ease'},
  entered: {opacity: 1},
  exiting: {opacity: 0, transition: 'all 1s ease'},
  exited: {opacity: 0},
  unmounted: {opacity: 0},
};

const FadeWrapper: React.FC = ({children}) => {
  const classes = useStyles();
  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
    return () => {
      setMount(false);
    };
  }, []);

  return (
    <Transition in={mount} timeout={1500}>
      {
        (state: TransitionStatus) => (
          <div className={classes.root} style={transitionStyles[state]} >
            {children}
          </div>
        )
      }
    </Transition>
  );
};

export default FadeWrapper;
