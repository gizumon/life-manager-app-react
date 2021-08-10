import { createMuiTheme } from '@material-ui/core/styles';
import { blue, red } from '@material-ui/core/colors';
import { Theme } from '@material-ui/core';

// Create a theme instance.
const defaultTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#1995ad',
    },
    secondary: {
      main: '#bcbabe',
    },
    error: {
      main: '#fc2f60',
    },
    warning: {
      main: '#fc2f60',
    },
    info: {
      // main: red.A400,
    },
    success: {
      // main: blue.A400,
    },
    background: {
      default: '#f1f1f2',
      paper: '#ffffff',
    },
    text: {
      primary: '#222222',
      // secondary: '#EEEEEE',
      hint: '#EEEEEE',
    }
  },
});

const redTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#FF4848',
    },
    secondary: {
      main: '#C2FFD9',
      dark: '#9DDAC6',
    },
    error: {
      main: '#fc2f60',
    },
    warning: {
      main: '#fc2f60',
    },
    info: {
      main: red.A400,
    },
    success: {
      main: blue.A400,
    },
    background: {
      default: '#FFD371',
    },
  },
});

const blueTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#0A81AB',
    },
    secondary: {
      main: '#C2FFD9',
      dark: '#9DDAC6',

    },
    error: {
      main: '#fc2f60',
    },
    warning: {
      main: '#fc2f60',
    },
    info: {
      main: red.A400,
    },
    success: {
      main: blue.A400,
    },
    background: {
      default: '#DEEDF0',
    },
  },
});

const retroTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#F24C30',
    },
    secondary: {
      main: '#DDDAC5',
      dark: '#A0937D',
    },
    error: {
      main: '#FFD371',
    },
    warning: {
      main: '#fc2f60',
    },
    info: {
      main: red.A400,
    },
    success: {
      main: blue.A400,
    },
    background: {
      default: '#5F939A',
    },
    text: {
      primary: '#222222',
      hint: '#EEEEEE',
    }
  },
});

const themeMap: {[key: string]: Theme} = {
  default: defaultTheme,
  child: redTheme,
  cool: blueTheme,
  retro: retroTheme,
};

const getTheme = (type: string = 'default'): Theme => {
   return themeMap[type] || themeMap.default;
}

const theme = getTheme();
export default theme;
