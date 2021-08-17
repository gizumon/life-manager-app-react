import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { IThemeSetting, IThemeType } from '../interfaces/index';
import { themeConfigs } from '../styles/theme';

type IProps = {
    setting: IThemeSetting;
    setSetting: React.Dispatch<React.SetStateAction<IThemeSetting>>;
    onUpdated?: (values: IThemeSetting) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      width: '95%',
    },
    colorBlocks: {

    }
  }),
);

export default function ThemeSetting({setting, setSetting, onUpdated}: IProps) {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSetting((state) => {
      const updateState = {...state, selectedTheme: event.target.value as IThemeType};
      onUpdated && onUpdated(updateState);
      return updateState;
    });
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-outlined-label">テーマ選択</InputLabel>
        <Select
          labelId="select-label"
          id="select"
          value={setting.selectedTheme}
          onChange={handleChange}
          label="テーマ選択"
          margin="dense"
        >
          <MenuItem value="">
            <em>---</em>
          </MenuItem>
          {
            themeConfigs.map(config => (
              <MenuItem key={config.id} value={config.id}>
                {config.label}
              </MenuItem>
            ))
          }
        </Select>
      </FormControl>
    </div>
  );
}