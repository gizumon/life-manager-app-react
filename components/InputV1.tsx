import React from 'react';
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

  const onChangeHandler = (event: any) => {
    setProps((prevVal: any) => {
      return {...prevVal, [config.id]: type === 'number' ? formatValue(event.target.value) : event.target.value}
    });
  };

  const formatValue = (val: number | any): number | null => {
    if (val === undefined || val === null || val === '') { return null; }
    let min: number | undefined;
    let max: number | undefined;
    let result: number;
    const formattedVal = Math.floor(Number(val));
    config.validates.forEach(valid => {
      switch (valid.type) {
        case 'isGT':
        case 'isGE':
          min = valid.args && valid.args[0];
          break;
        case 'isLT':
        case 'isLE':
          max = valid.args && valid.args[0];
          break;
        case 'isBTW':
          min = valid.args && valid.args[0];
          max = valid.args && valid.args[1];
          break;
      }
    })
    result = formattedVal;
    if (min !== undefined) {
      result = formattedVal < min ? min : result; 
    }
    if (max !== undefined) {
      result = formattedVal > max ? max : result; 
    }
    return result;
  } 

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
