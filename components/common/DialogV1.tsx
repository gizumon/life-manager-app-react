import React from 'react';
// import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
// import { FC } from 'react';
import {createStyles, makeStyles, Theme} from '@material-ui/core';

export interface ConfirmationDialogRawProps {
  classes?: string;
  id: string;
  title: string;
  value: string;
  open: boolean;
  content: any;
  cancelBtnTitle?: string;
  okBtnTitle?: string;
  onClose: (value?: string) => void;
}

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      '& .MuiPaper-root': {
        minWidth: '300px',
        maxWidth: '80vw',
      },
      '& .MuiPaper-rounded': {
        borderRadius: '0px',
      },
      '& .MuiDialogContent-dividers': {
        padding: '8px 8px',
      },
    },
    btns: {
      padding: '2px',
    },
  }),
);

export function DialogV1(props: ConfirmationDialogRawProps) {
  const {classes, onClose, value, open, content, cancelBtnTitle = 'cancel', okBtnTitle = 'OK', title, ...other} = props;
  const defaultClasses = useStyles();

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(value);
  };

  return (
    <Dialog
      className={classes || defaultClasses.root}
      maxWidth="md"
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
      <DialogActions className={defaultClasses.btns}>
        <Button onClick={handleOk} color="primary">
          {okBtnTitle}
        </Button>
        <Button autoFocus onClick={handleCancel} color="default">
          {cancelBtnTitle}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
