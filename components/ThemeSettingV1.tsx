import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { IThemeSetting, IThemeType } from '../interfaces/index';
import { themeConfigs, getThemeSource } from '../styles/theme';

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
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
    },
    colorBlock: {
      width: '20%',
      paddingTop: '5%',
      paddingBottom: '5%',
      '& div': {
        display: 'flex',
        textAlign: 'center',
        fontSize: '0.6rem',
        fontWeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
        '&:first-child': {
          fontWeight: 700,
        }
      }
    }
  }),
);

export default function ThemeSetting({setting, setSetting, onUpdated}: IProps) {
  const classes = useStyles();
  const theme = getThemeSource(setting.selectedTheme);

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
      <div className={classes.colorBlocks}>
        {
          Object.keys(theme).map((key: string) => {
            const paletteOptions = theme[key as keyof typeof theme];
            return Object.keys(paletteOptions as any).map((type) => {
              const color: string = paletteOptions ? paletteOptions[type as keyof typeof paletteOptions] : '#ffffff';
              return (
                <div key={type} className={classes.colorBlock} style={{backgroundColor: color}}>
                  <div style={{color: color, filter: 'invert(100%) grayscale(100%) contrast(100)'}}>{key}</div>
                  <div style={{color: color, filter: 'invert(100%) grayscale(100%) contrast(100)'}}>{type}</div>
                </div>
              )
            })
          })
        }
      </div>
    </div>
  );
}