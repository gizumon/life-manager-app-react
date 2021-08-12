import React, { useCallback } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { IInput, ICategory } from '../interfaces';

type IProps = {
    config: IInput;
    model: String;
    setProps: React.Dispatch<React.SetStateAction<any>>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      width: '95%',
    },
  }),
);

export default function SelectV1({config, model, setProps}: IProps) {
  const classes = useStyles();
  // const [state, setState] = React.useState(model);
  console.log('Select: ', model);

  const handleChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
    // setState(event.target.value as string);
    setProps((prevVal: any) => {
      // console.log('handle change:', prevVal, event.target.value)
      return {...prevVal, [config.id]: event.target.value}
    });
  }, []);

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-outlined-label">{config.name}</InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={model}
          onChange={handleChange}
          label={config.name}
          margin="dense"
        >
          <MenuItem value="">
            <em>---</em>
          </MenuItem>
          {
              config && (config.dataList || [])
                .filter(data => data.hasOwnProperty('isHide') ? !(data as ICategory).isHide: true)
                .map(data => {
                  return (
                    <MenuItem key={data.id} value={data.id}>
                        {data.name}
                    </MenuItem>
                  );
                })
          }
        </Select>
      </FormControl>
    </div>
  );
}