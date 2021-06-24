import React, { useCallback } from 'react';
import { IInput } from '../interfaces';
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

type IProps = {
    config: IInput;
    model: any;
    setProps: React.Dispatch<React.SetStateAction<any>>;
    type?: string;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: 2,
      marginBottom: 2,
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: '95%',
    },
  }),
);

export default function InputV1({ config, model, setProps, type='' }: IProps) {
  console.log('InputV1 model', model);
  const classes = useStyles();

  const onChangeHandler = useCallback((event: any) => {
    console.log('!!!On Input handler: ', event);
    setProps((prevVal: any) => {
      return {...prevVal, [config.id]: type === 'number' ? Number(event.target.value) : event.target.value}
    });
  }, []);

  // useEffect(() => {
  //   setProps((prevVal: any) => {
  //     return {...prevVal, [config.id]: type === 'number' ? Number(state) : state}
  //   });
  // }, [state]);

  return (
    <div className={classes.root}>
      <TextField
        label={config.name}
        id={config.id}
        className={classes.textField}
        placeholder={config.placeholder}
        margin="dense"
        onChange={onChangeHandler}
        type={type}
        required={config.validates?.some((validate) => validate.type === "isNotNull")}
        value={model}
        />
    </div>
  );
}
