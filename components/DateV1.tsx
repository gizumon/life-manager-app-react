import React from 'react';
import { IInput } from '../interfaces';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';


type IProps = {
    config: IInput;
    model: any;
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

export default function DateV1({config, model}: IProps) {
  console.log('DateV1 component', config, model);
  const classes = useStyles();

  return (
    <form className={classes.container} noValidate>
      <TextField
        id={config.id}
        label={config.name}
        type="date"
        defaultValue={config.model}
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </form>
  );
}
