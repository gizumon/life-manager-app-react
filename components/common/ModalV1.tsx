import React, {Fragment, useState} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
export interface IProps {
  title?: string;
  body?: string;
  open: boolean;
  onClose: (value?: string) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      position: 'absolute',
      width: 300,
      whiteSpace: 'pre-wrap',
      backgroundColor: theme.palette.background.paper,
      // border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(1, 2, 2),
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      transition: 'all 0.5s 0s ease',
    },
  }),
);

export default function ModalV1({title, body, open, onClose}: IProps) {
  const classes = useStyles();

  return (
    <Fragment>
      <Modal
        open={open}
        onClose={onClose}
      >
        <div className={classes.paper}>
          <h2 id="simple-modal-title">{title}</h2>
          <p id="simple-modal-description">
            {body}
          </p>
        </div>
      </Modal>
    </Fragment>
  );
}

export interface IModalConfig {
  isOpen?: boolean;
  message?: string;
}

export interface IUseModal {
  isOpen: boolean;
  message: string;
  funcObj: {fn: () => void};
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setFuncObj: React.Dispatch<React.SetStateAction<{fn: () => void}>>;
}

export const useModal = (conf: IModalConfig = {}) => {
  const [isOpen, setIsOpen] = useState<IUseModal['isOpen']>(conf.isOpen || false);
  const [message, setMessage] = useState<IUseModal['message']>(conf.message || '');
  const [funcObj, setFuncObj] = useState<IUseModal['funcObj']>({fn: () => {
    setIsOpen(false);
    setMessage('');
  }});

  return {
    isOpen,
    message,
    funcObj,
    setIsOpen,
    setMessage,
    setFuncObj,
  };
};
