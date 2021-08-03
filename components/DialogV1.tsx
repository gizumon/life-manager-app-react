import React from 'react';
// import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
// import { FC } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

export interface ConfirmationDialogRawProps {
  classes?: string;
  id: string;
  title: string;
  // keepMounted: boolean;
  value: string;
  open: boolean;
  content: any;
  cancelBtnTitle?: string;
  okBtnTitle?: string;
  onClose: (value?: string) => void;
}

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    paper: {
      // position: 'absolute',
      // width: 300,
      // backgroundColor: theme.palette.background.paper,
      // // border: '2px solid #000',
      // boxShadow: theme.shadows[5],
      // padding: theme.spacing(1, 2, 2),
      // top: '50%',
      // left: '50%',
      // transform: 'translate(-50%, -50%)',
      // transition: 'all 0.5s 0s ease',
    },
  }),
);

export function DialogV1(props: ConfirmationDialogRawProps) {
  const { classes, onClose, value: valueProp, open, content, cancelBtnTitle = 'cancel', okBtnTitle = 'OK', title, ...other } = props;
  const [value, setValue] = React.useState(valueProp);
  const defaultClasses = useStyles();
  React.useEffect(() => {
    setValue(valueProp);
  }, [valueProp, open]);

  const handleEntering = () => {};

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Dialog
      className={classes || defaultClasses.paper}
      maxWidth="xs"
      onEntering={handleEntering}
      aria-labelledby="dialog-title"
      open={open}
      {...other}
    >
      {
        title && <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      }
      <DialogContent dividers>
        {content}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel} color="primary">
          {cancelBtnTitle}
        </Button>
        <Button onClick={handleOk} color="primary">
          {okBtnTitle}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
