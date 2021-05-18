import React from 'react';
import { IInput } from '../interfaces';
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

type IProps = {
    config: IInput;
    model: any;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: '95%',
    },
  }),
);

export default function InputV1({ config, model }: IProps) {
    const classes = useStyles();
    console.log('InputV1 component run as: ', model, config);
    return (
        <div className={classes.root}>
            <TextField
                label={config.name}
                id="input-v1-field"
                defaultValue={model}
                className={classes.textField}
                placeholder={config.placeholder}
                margin="dense"
                />
        </div>
    );
}
