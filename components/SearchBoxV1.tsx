import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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
      padding: '0px 4px',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
    },
    input: {
      marginRight: theme.spacing(1),
      flex: 1,
      fontSize: '0.8rem',
    },
    iconButton: {
      padding: '1px',
    },
  }),
);

export default function SearchBox({ value, setValue }: IProps) {
  console.log(value, setValue);
  const classes = useStyles();

  const onChangeHandler = (event: any) => {
    setValue(event.target.value);
  };

  return (
    <Paper component="form" className={classes.root}>
      <IconButton type="submit" className={classes.iconButton} aria-label="search">
        <SearchIcon />
      </IconButton>
      <InputBase
        className={classes.input}
        placeholder="キーワード検索"
        inputProps={{ 'aria-label': 'Filtered by keyword' }}
        onChange={onChangeHandler}
        value={value}
      />
    </Paper>
  );
}
