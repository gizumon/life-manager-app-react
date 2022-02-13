import { createTheme } from '@material-ui/core/styles';
import { blue, red } from '@material-ui/core/colors';
import { Theme } from '@material-ui/core';
import { IThemeType } from '../interfaces';
import { IThemeConfig } from '../interfaces/index';
import { PaletteOptions } from '@material-ui/core/styles/createPalette';

// Create a theme instance.
const defaultTheme: PaletteOptions = {
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
  // info: {
  //   main: red.A400,
  // },
  // success: {
  //   main: blue.A400,
  // },
  background: {
    default: '#f1f1f2',
    paper: '#ffffff',
  },
  text: {
    primary: '#222222',
    // secondary: '#EEEEEE',
    hint: '#EEEEEE',
  }
};

const redTheme: PaletteOptions = {
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
  text: {
    primary: '#222222',
    // secondary: '#EEEEEE',
    hint: '#EEEEEE',
  }
};

const blueTheme: PaletteOptions = {
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
  text: {
    primary: '#222222',
    // secondary: '#EEEEEE',
    hint: '#EEEEEE',
  }
};

const craftTheme: PaletteOptions = {
  primary: {
    main: '#34485e',
  },
  secondary: {
    main: '#a2a2ad',
    dark: '#5e5e6a',
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
    default: '#dcd5c8',
  },
  text: {
    primary: '#222222',
    // secondary: '#EEEEEE',
    hint: '#EEEEEE',
  }
};

const retroTheme: PaletteOptions = {
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
};

export const themeConfigs: IThemeConfig[] = [{
  id: 'default',
  label: 'おすすめ',
  palettesOptions: defaultTheme,
}, {
  id: 'craft',
  label: 'CRAFT',
  palettesOptions: craftTheme,
},{
  id: 'cool',
  label: 'COOL',
  palettesOptions: blueTheme,
},{
  id: 'retro',
  label: 'RETRO',
  palettesOptions: retroTheme,
}];

export const getTheme = (type: IThemeType = 'default', palette?: PaletteOptions): Theme => {
  return createTheme({ palette: getThemeSource(type, palette)});
}

export const getThemeSource = (type: IThemeType = 'default', palette?: PaletteOptions): PaletteOptions => {
  const theme = type === 'custom' ? palette : themeConfigs.find((config) => config.id === type)?.palettesOptions;
  return theme || defaultTheme;
}

const theme = getTheme();
export default theme;

// test
// const test: PaletteOptions = {
//   primary: {
//     main: '#ff0000',
//   },
//   secondary: {
//     main: '#00ff00',
//   },
//   error: {
//     main: '#0000ff',
//   },
//   warning: {
//     main: '#00ffff',
//   },
//   // info: {
//   //   main: red.A400,
//   // },
//   // success: {
//   //   main: blue.A400,
//   // },
//   background: {
//     default: '#ff00ff',
//     paper: '#ffff00',
//   },
//   text: {
//     primary: '#f0a00f',
//     secondary: '#0A81AB',
//     hint: '#997755',
//   }
// };