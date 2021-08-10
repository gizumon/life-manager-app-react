import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import EditIcon from '@material-ui/icons/Edit';
import ListIcon from '@material-ui/icons/List';
import SettingsIcon from '@material-ui/icons/Settings';
import { useRouter } from 'next/router';
import theme from '../styles/theme';
import Utils from '../services/utilsService';

type INavIndex = 0 | 1 | 2;
type IUrlType = '/input' | '/list' | '/manage';
interface INavMap {
  toUrl: {
    [key in INavIndex]: IUrlType
  },
  toIndex: {
    [key in IUrlType]: INavIndex
  }
};

const navMap: INavMap = {
  toUrl: {
    0: '/input',
    1: '/list',
    2: '/manage',  
  },
  toIndex: {
    '/input': 0,
    '/list': 1,
    '/manage': 2,
  }
}

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    width: '100vw',
    bottom: '0px',
    zIndex: 1000,
    background: theme.palette.secondary.main,
    '& .MuiButtonBase-root': {
      color: theme.palette.secondary.dark,
      '&.Mui-selected': {
        color: theme.palette.primary.main,
      },
      '&.Mui-disabled': {
        color: theme.palette.grey[500],
      } 
    }
  },
});

export default function FooterV1() {
  const router = useRouter()
  const classes = useStyles();
  const selectedType = router.query['type'] as string || Utils.getQueryParam(router.asPath, 'type') || 'pay';
  const isLoginPage = router.asPath.indexOf('/login') > -1;
  const [navIndex, setNavIndex] = React.useState(navMap.toIndex[router.pathname as IUrlType] || 0);

  const onChangeNav = (_: React.ChangeEvent<{}>, index: INavIndex) => {
    router.push(Utils.makeUrl(navMap.toUrl[index], selectedType), undefined, {shallow: true});
  };

  router.events.on('routeChangeComplete', () => setNavIndex(navMap.toIndex[router.pathname as IUrlType]));

  return (
    <BottomNavigation
      value={navIndex}
      onChange={onChangeNav}
      showLabels
      className={classes.root}
    >
      <BottomNavigationAction label="Input" icon={<EditIcon />} disabled={isLoginPage}/>
      <BottomNavigationAction label="List" icon={<ListIcon />} disabled={isLoginPage}/>
      <BottomNavigationAction label="Manage" icon={<SettingsIcon />} disabled={isLoginPage}/>
    </BottomNavigation>
  );
}
