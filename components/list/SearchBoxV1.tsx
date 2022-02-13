import React, {useState} from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

type IProps = {
  value: string;
  setValue: (key: string) => void;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 'calc(100% - 30px)',
      padding: '0px 1px',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      float: 'right',
      transitionProperty: 'width',
      transitionDelay: '0s',
      transitionDuration: '0.3s',
    },
    isClose: {
      'width': '30px',
      'borderRadius': '50%',
      'float': 'right',
      'transitionProperty': 'width, border-radius',
      'transitionDelay': '0s, 0.2s',
      'transitionDuration': '0.2s, 0.2s',
      '& .MuiInputBase-root': {
        marginRight: 0,
      },
    },
    input: {
      'marginRight': theme.spacing(1),
      'flex': 1,
      'fontSize': '0.8rem',
      '& .MuiInputBase-input': {
        textIndent: '5px',
      },
    },
    iconButton: {
      padding: '1px',
    },
  }),
);

export default function SearchBox({value, setValue}: IProps) {
  const classes = useStyles();
  const [isClose, setIsOpen] = useState<boolean>(true);

  const onChangeHandler = (event: any) => {
    setValue(event.target.value);
  };

  const onClickHandler = () => {
    setValue('');
    setIsOpen(!isClose);
  };

  return (
    <Paper component="form" className={isClose ? classes.root + ' ' + classes.isClose : classes.root}>
      <InputBase
        className={classes.input}
        placeholder="キーワード検索"
        inputProps={{'aria-label': 'Filtered by keyword'}}
        onChange={onChangeHandler}
        value={value}
      />
      <IconButton className={classes.iconButton} aria-label="search" onClick={onClickHandler}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}
