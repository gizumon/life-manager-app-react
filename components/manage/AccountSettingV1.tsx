import React, {useEffect, useState} from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

import {IAccountSetting} from '../../interfaces/index';
import TextField from '@material-ui/core/TextField';
import {Button} from '@material-ui/core';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';

type IProps = {
    setting: IAccountSetting;
    setSetting: React.Dispatch<React.SetStateAction<IAccountSetting>>;
    onUpdated?: (values: IAccountSetting) => void;
    onClickButton?: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: 2,
      marginBottom: 2,
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(2),
      width: '95%',
    },
    btn: {
      marginLeft: theme.spacing(1),
      minWidth: '80%',
    },
  }),
);

export default function AccountSetting({setting, setSetting, onUpdated, onClickButton}: IProps) {
  const classes = useStyles();
  // const [isClicked, setIsClicked] = useState(false);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSetting((state) => {
      const updateState = {...state, name: (event.target.value as string || '')};
      onUpdated && onUpdated(updateState);
      return updateState;
    });
  };

  const handleClick = () => {
    // if (isClicked) {
    //   return false;
    // }
    // setIsClicked(true);
    onClickButton && onClickButton();
  };

  // useEffect(() => {
  //   isClicked && setTimeout(() => setIsClicked(false), 3000);
  // }, [isClicked]);

  return (
    <div>
      <TextField
        label="Name"
        className={classes.textField}
        placeholder="ex) Taro"
        margin="dense"
        onChange={handleChange}
        type="text"
        required={true}
        value={setting.name}
      />
      {/* <TextField
        label="Group ID"
        className={classes.textField}
        placeholder="ペアリングコードを設定"
        margin="dense"
        onChange={handleChange}
        type="text"
        required={true}
        value={setting.groupId}
      /> */}
      <Button
        size="small"
        variant="contained"
        className={classes.btn}
        color="primary"
        onClick={handleClick}
        startIcon={<AssignmentTurnedInIcon />}
      >
        ペアリングコードを取得
      </Button>
    </div>
  );
}
