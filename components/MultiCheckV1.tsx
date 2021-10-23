import React from 'react';
import {createStyles, makeStyles, useTheme, Theme} from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';

import {IInput} from '../interfaces';
import {Avatar} from '@material-ui/core';
import {IMember} from '../interfaces/index';

type IProps = {
    config: IInput;
    model: string[];
    setProps: React.Dispatch<React.SetStateAction<any>>;
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

export default function MultiCheckV1({config, model = [], setProps}: IProps) {
  const classes = useStyles();
  const theme = useTheme();
  // const [ids, setIds] = React.useState(model);
  const dataList = config.dataList || [];

  const handleChangeMultiple = (event: React.ChangeEvent<{ value: unknown }>) => {
    console.log('on change: ', event);
    const options = event.target;
    // setIds(options.value as string[]);
    setProps((prevVal: any) => {
      return {...prevVal, [config.id]: options.value};
    });
  };

  // const handleDelete = () => {

  // };

  // useEffect(() => {
  //   setProps((prevVal: any) => {
  //     return {...prevVal, [config.id]: ids}
  //   });
  // }, [ids]);

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="multiple-chip-label">{config.name}</InputLabel>
        <Select
          labelId="multiple-chip-label"
          id="multiple-chip"
          multiple
          value={model}
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
                  })?.name
                }
                className={classes.chip}
                // onDelete={handleDelete}
                avatar={<Avatar src={
                  (config.dataList?.find((data: IMember) => {
                    if (data.id === id ) {
                      return !!data.picture;
                    }
                  }) as IMember)?.picture}
                />}
                />
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
