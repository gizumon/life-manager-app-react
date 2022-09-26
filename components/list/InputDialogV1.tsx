import React from 'react';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import {createStyles, makeStyles, Theme} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

export interface IModalInputConfig {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder: string;
  isRequired: boolean;
  args?: any[]
}

interface IProps {
  title?: string;
  configs: IModalInputConfig[];
  isOpen: boolean;
  cancelBtnTitle?: string;
  okBtnTitle?: string;
  onClose: (values?: IModalInputConfig[]) => void;
  // onChange?: (event: any) => void;
}

export const defaultConfig = {
  id: 'default',
  label: '',
  type: 'text',
  value: '',
  placeholder: '',
  isRequired: false,
};

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
    textField: {

    },
  }),
);

export function InputDialogV1(props: IProps) {
  const {title, configs: defaultConfigs, isOpen, cancelBtnTitle = 'cancel', okBtnTitle = 'OK', onClose, ...other} = props;
  const [configs, setConfigs] = React.useState<IModalInputConfig[]>(defaultConfigs);
  const classes = useStyles();
  React.useEffect(() => {
    setConfigs(defaultConfigs);
  }, [defaultConfigs, isOpen]);

  const handleCancel = () => onClose();
  const handleOk = () => onClose(configs);
  const handleOnChange = (index: number) => {
    return (event: any) => {
      setConfigs((prevConfigs: IModalInputConfig[]) => {
        prevConfigs[index].value = event.target.value;
        return [...prevConfigs];
      });
    };
  };

  return (
    <Dialog
      className={classes.root}
      maxWidth="md"
      aria-labelledby="dialog-title"
      open={isOpen}
      {...other}
    >
      {
        title && <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      }
      <DialogContent dividers>
        {
          configs.map((config, index) => (
            <TextField
              key={config.id}
              label={config.label}
              id={config.id}
              className={classes.textField}
              placeholder={config.placeholder}
              margin="dense"
              onChange={handleOnChange(index)}
              type={config.type}
              required={config.isRequired}
              value={config.value}
            />
          ))
        }
      </DialogContent>
      <DialogActions className={classes.btns}>
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
