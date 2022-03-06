import React from 'react';
import TextField from "@material-ui/core/TextField";
import { DateRangePicker, DateRange, DateRangeDelimiter } from "@material-ui/pickers";
import Box from '@material-ui/core/Box';
import { Grid } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

interface IProps {
  dateRange?: DateRange<Date>;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange<Date>>>;
}

const useStyles = makeStyles((_) =>
  createStyles({
    root: {
      '& .MuiPickersDateRangePickerInput-root': {
        flexDirection: 'row',
        '& .MuiFormHelperText-root': {
          display: 'none',
        },
      },
    },
  }),
);

export default function DateRangeBox({ dateRange = [null, null], setDateRange }: IProps) {
  const classes = useStyles();

  return (
    <Box margin="10px">
      <Grid className={classes.root} xs={12}>
        <DateRangePicker
          startText="Start"
          endText="End"
          value={dateRange}
          onChange={(newValue) => setDateRange(newValue)}
          renderInput={(startProps, endProps) => (
            <React.Fragment>
                <Grid xs={5}>
                  <TextField margin="dense" {...startProps} />
                </Grid>
                <Grid xs={2}>
                  <DateRangeDelimiter> 〜 </DateRangeDelimiter>
                </Grid>
                <Grid xs={5}>
                  <TextField  margin="dense" {...endProps} />
                </Grid>
            </React.Fragment>
          )}
        />
      </Grid>
    </Box>
  );
};
