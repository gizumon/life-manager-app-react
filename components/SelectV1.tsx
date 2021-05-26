import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { IInput } from '../interfaces';

type IProps = {
    config: IInput;
    model: String;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      width: '95%',
    },
  }),
);

export default function SelectV1({config, model}: IProps) {
  const classes = useStyles();
  const [item, setItem] = React.useState(model);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setItem(event.target.value as string);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-outlined-label">{config.name}</InputLabel>
        <Select
          labelId="demo-simple-select-outlined-label"
          id="demo-simple-select-outlined"
          value={item}
          onChange={handleChange}
          label={config.name}
          margin="dense"
        >
          <MenuItem value="">
            <em>---</em>
          </MenuItem>
          {
              config && config.dataList?.map(data => {
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