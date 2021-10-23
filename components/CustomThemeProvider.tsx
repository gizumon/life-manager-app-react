import {Theme} from '@material-ui/core';
import {FC, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {StoreState} from '../ducks/createStore';
import {FirebaseState} from '../ducks/firebase/slice';
import {getTheme} from '../styles/theme';
import {ThemeProvider} from '@material-ui/core/styles';

// const ThemeContext = createContext<Theme>(getTheme());
export const CustomThemeProvider: FC = ({children}) => {
  const {groupTheme} = useSelector<StoreState, FirebaseState>((state) => state.firebase);
  const [theme, setTheme] = useState<Theme>(getTheme(groupTheme?.selectedTheme));

  useEffect(() => {
    setTheme(getTheme(groupTheme?.selectedTheme, groupTheme?.custom));
  }, [groupTheme]);


  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};
