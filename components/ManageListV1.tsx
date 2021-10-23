
import React from 'react';
import {makeStyles, createStyles, Theme, List, ListItem, ListSubheader, ListItemText, ListItemSecondaryAction, Switch, IconButton, ListItemIcon} from '@material-ui/core';
import {Container, Draggable, DropResult} from 'react-smooth-dnd';

import DragHandleIcon from '@material-ui/icons/DragHandle';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

import {ICategory} from '../interfaces/index';
import Utils from '../services/utils';
import * as _ from 'lodash';

interface IListType {
  type: string;
  label: string;
}
interface IProps {
  listType: IListType;
  dataList: ICategory[];
  setDataList: React.Dispatch<React.SetStateAction<ICategory[]>>;
  onClickUpsertBtn: (id?: string) => void;
  onUpdated?: (values: ICategory[]) => void;
}

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
    },
    addBtn: {
      width: '100%',
      margin: '5px 0px',
      padding: '0px',
      border: 'solid',
      borderRadius: '6px',
    },
    editBtn: {},
    dragBtn: {
      '& svg': {
        color: '#424242',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '2px',
        width: '25px',
      },
    },
    onDragging: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '4px',
    },
  }),
);

// const categoryTypeList = [
//   { type: 'pay', label: 'Pay' },
//   { type: 'tobuy', label: 'ToBuy' }
// ];

export default function ManageList(props: IProps) {
  const {listType, dataList, setDataList, onClickUpsertBtn, onUpdated} = props;
  const classes = useStyles();
  const displayList = dataList.filter((data) => data.type === listType.type)
      .sort((data1, data2) => Utils.asc(data1.setting.order, data2.setting.order));

  const onDropHandler = (dropResult: DropResult) => {
    const {removedIndex, addedIndex} = dropResult;
    if (removedIndex === null || addedIndex === null) {
      return;
    }
    setDataList((states) => {
      const newOrderedList = Utils.arrayMove(displayList, removedIndex, addedIndex);
      const updateStates = _.cloneDeep(states);
      newOrderedList.forEach((data, index) => {
        updateStates.forEach((state) => {
          if (state.id === data.id) {
            state.setting.order = index;
          }
        });
      });
      onUpdated && onUpdated(updateStates);
      return [...updateStates];
    });
  };

  return (
    <List dense className={classes.root} subheader={<ListSubheader>{listType.label}</ListSubheader>}>
      <Container onDrop={onDropHandler} dragClass={classes.onDragging} lockAxis="y" >
        {
          displayList.map((newCategory) => (
            <Draggable key={newCategory.id}>
              <ListItem>
                <ListItemIcon className={classes.dragBtn}>
                  <DragHandleIcon fontSize="small"/>
                </ListItemIcon>
                <ListItemText id="switch-list-label" primary={newCategory.name} />
                <ListItemSecondaryAction>
                  <IconButton className={classes.editBtn} edge="end" aria-label="edit" onClick={() => onClickUpsertBtn(newCategory.id)}>
                    <EditIcon fontSize="small"/>
                  </IconButton>
                  <Switch
                    edge="end"
                    onChange={() => setDataList((states) => {
                      const updateStates = _.cloneDeep(states);
                      updateStates.forEach((state) => {
                        if (state.id === newCategory.id) {
                          state.isHide = !state.isHide;
                        }
                      });
                      onUpdated && onUpdated(updateStates);
                      return [...updateStates];
                    })}
                    checked={!newCategory.isHide}
                    size="small"
                    color="primary"
                    inputProps={{'aria-labelledby': 'switch-list-label-is-input-show'}}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </Draggable>
          ))
        }
      </Container>
      <ListItem>
        <IconButton className={classes.addBtn} color="primary" aria-label="add-new-one" onClick={() => onClickUpsertBtn()}>
          <AddIcon />
        </IconButton>
      </ListItem>
    </List>
  );
}
