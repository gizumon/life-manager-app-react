import React from 'react';
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';

import { IInput, IModel } from '../interfaces';

type IProps = {
    config: IInput;
    model: IModel[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
        margin: theme.spacing(1),
        width: '95%',
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      marginRight: 2,
      marginLeft: 2,
      height: 24,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  }),
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// function getStyles(name: string, personName: string[], theme: Theme) {
//   return {
//     fontWeight:
//       personName.indexOf(name) === -1
//         ? theme.typography.fontWeightRegular
//         : theme.typography.fontWeightMedium,
//   };
// }
export default function MultiCheckV1({config, model}: IProps) {
  const classes = useStyles();
  const theme = useTheme();
  console.log('!!!', config, model);
  const [ids, setIds] = React.useState([] as string[]);
  // const [ids, setIds] = React.useState(model.map((data) => data.id) || []);
  const dataList = config.dataList || [];


  // const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
  //   setIds([event.target.value]);
  // };

  const handleChangeMultiple = (event: React.ChangeEvent<{ value: unknown }>) => {
    console.log('event', event);
    const options = event.target;
    // const ids: string[] = [];
    // console.log('options', options, 'target', event.target);
    // for (let i = 0, l = options.length; i < l; i += 1) {
    //   if (options[i].selected) {
    //     ids.push(options[i].value);
    //   }
    // }
    setIds(options.value as string[]);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="multiple-chip-label">Chip</InputLabel>
        <Select
          labelId="multiple-chip-label"
          id="multiple-chip"
          multiple
          value={ids}
          onChange={handleChangeMultiple}
          input={<Input id="select-multiple-chip" />}
          renderValue={(selected) => (
            <div className={classes.chips}>
              {(selected as string[]).map((id) => (
                <Chip key={id} label={
                  config.dataList?.find((data) => {
                    if (data.id === id) {
                      return data.name;
                    }
                  })
                } className={classes.chip} />
              ))}
            </div>
          )}
          MenuProps={MenuProps}
          margin="dense"
        >
          {dataList.map((data) => (
            <MenuItem key={data.id} value={data.id} style={{fontWeight: theme.typography.fontWeightMedium}}>
              {data.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}