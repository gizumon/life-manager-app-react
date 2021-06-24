import React, { useCallback, useEffect, useState } from 'react';
import { IInput } from '../interfaces';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Utils from '../services/utilsService';

type IProps = {
    config: IInput;
    model: any;
    setProps: React.Dispatch<React.SetStateAction<any>>;
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: 7,
    marginBottom: 6,
    width: '100%',
  },
}));

export default function DateV1({config, model, setProps}: IProps) {
  const classes = useStyles();
  // const [state, setState] = useState(model);

  const onChangeHandler = useCallback((event: any) => {
    // setState(event.target.value);
    setProps((prevVal: any) => {
      return {...prevVal, [config.id]: Utils.formatDate(new Date(event.target.value))}
    });
  }, []);

  // useEffect(() => {
  //   setProps((prevVal: any) => {
  //     return {...prevVal, [config.id]: state}
  //   });
  // }, [state]);

  return (
    <form className={classes.container} noValidate>
      <TextField
        id={config.id}
        label={config.name}
        type="date"
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
        onInput={onChangeHandler}
        value={model}
      />
    </form>
  );
}
