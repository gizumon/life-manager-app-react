import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import EditIcon from '@material-ui/icons/Edit';
import ListIcon from '@material-ui/icons/List';
import SettingsIcon from '@material-ui/icons/Settings';
import { useRouter } from 'next/router';
import { IConfigType } from '../interfaces';

type INavIndex = 0 | 1 | 2;
type IUrlType = '/input' | '/view' | '/manage';
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
    1: '/view',
    2: '/manage',  
  },
  toIndex: {
    '/input': 0,
    '/view': 1,
    '/manage': 2,
  }
}

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    width: '100vw',
    bottom: '0px',
    zIndex: 1000,
  },
});

function makeUrl(baseUrl: string = '', id: string = '', type: string = ''): string {
  let url = baseUrl;
  // ①id && type || ②id && !type || ③!id && type || ④!id && !type
  if (id) {
    // ②
    url += `?id=${id}`;
    if (type) {
      // ①
      url += `&type=${type}`;
    }
  } else if (type) {
    // ③
    url += `?type=${type}`;
  }
  return url;
}

export default function FooterV1() {
  const router = useRouter()
  const classes = useStyles();
  const selectedId = router.query.id as string || '';
  const selectedType = router.query.type as IConfigType || '';

  const [navIndex, setNavIndex] = React.useState(navMap.toIndex[router.pathname as IUrlType] || 0);
  console.log('footer element', router);

  const onChangeNav = useCallback((_: React.ChangeEvent<{}>, index: INavIndex) => {
    setNavIndex(index);
    router.push(makeUrl(navMap.toUrl[index], selectedId, selectedType), undefined, {shallow: true});
  }, []);

  return (
    <BottomNavigation
      value={navIndex}
      onChange={onChangeNav}
      showLabels
      className={classes.root}
    >
      <BottomNavigationAction label="Input" icon={<EditIcon />} />
      <BottomNavigationAction label="View" icon={<ListIcon />} />
      <BottomNavigationAction label="Manage" icon={<SettingsIcon />} />
    </BottomNavigation>
  );
}
