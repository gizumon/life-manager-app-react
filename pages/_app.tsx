import React, {FC, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import {makeStyles} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import FooterV1 from '../components/FooterV1';
import {AuthProvider, useAuth} from '../hooks/useAuthLiff';
import {createStyles, Theme, CardMedia, Button} from '@material-ui/core';
import {Provider, useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import {useRouter} from 'next/router';
import {setUser} from '../ducks/user/slice';
import {UserState} from '../ducks/user/slice';
import {useFirebase, FirebaseProvider} from '../hooks/useFirebase';
import Progress from '../components/common/AnimationProgressV1';
import FadeWrapper from '../components/common/FadeWrapper';
import store, {StoreState} from '../ducks/createStore';
import {FirebaseState} from '../ducks/firebase/slice';
import {CustomThemeProvider} from '../components/provider/CustomThemeProvider';
import getConfig from 'next/config';
import { useGA } from '../hooks/useGA';
import InternalAPI from '../services/api';

const client = new InternalAPI();

const useStyles = makeStyles((_: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      margin: '-8px',
    },
    media: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
    },
    btn: {
      backgroundColor: '#00B900',
      color: 'white',
    },
  }),
);

const stateMap = {
  isInitializing: 0,
  isNotExistMember: 1,
  isExistMember: 2,
  isCompletedInitialize: 3,
  hasError: 9,
};

// logging check process
//   0. isInitializing
//     - description: sdk and data are initializing
//     - from       : - (initial status)
//     - to         : 1 or 2
//   1. isNotExistMember
//     - description: user could not find in database
//     - from       : 0
//     - to         : redirect to /login page
//   2. isExistMember
//     - description: user could find in database
//     - from       : 0
//     - to         : 3 (with setting user in session storage)
//   3. isCompletedInitialize
//     - description: initialize completed
//     - from       : 2
//     - to         : show child components
const Layout: FC = ({children}) => {
  const classes = useStyles();
  const router = useRouter();
  const {publicRuntimeConfig} = getConfig();
  // const { isInitialized, isLoggedIn, login, liff } = useAuth();
  const liff = useAuth();
  const firebase = useFirebase();
  const {isInitialized, isGroupActivated} = useSelector<StoreState, FirebaseState>((state) => state.firebase);
  const dispatch = useDispatch();
  const [state, setState] = useState<number>(stateMap.isInitializing);
  const baseUri = publicRuntimeConfig.ROOT_URL;
  const redirectUri = baseUri + router.asPath;
  const isLoginPage = router.asPath.indexOf('/login') > -1;
  const hasPrepared = !!firebase.activateGroup;

  useEffect(() => {
    const groupId = sessionStorage.getItem('gid');
    if (!groupId && !isLoginPage) {
      router.push(baseUri + '/login?redirectUri=' + redirectUri, undefined, {shallow: true});
    }
  });

  // line is not ready
  if (!liff.isInitialized) {
    return (
      <FadeWrapper>
        <Progress />
      </FadeWrapper>
    );
  }

  // user not logged in
  if (!liff.isLoggedIn || state === stateMap.hasError) {
    return (
      <FadeWrapper>
        <div className={classes.root}>
          <CardMedia
            className={classes.media}
            image="house.jpeg"
            title="Login Attentions"
          >
            <Button
              className={classes.btn}
              size="large"
              variant="contained"
              onClick={() => liff.login({redirectUri: redirectUri})}
            >LOGIN</Button>
          </CardMedia>
        </div>
      </FadeWrapper>
    );
  }

  // firebase is not ready
  if (!isInitialized || !hasPrepared) {
    return (
      <FadeWrapper>
        <Progress message="準備中。。。"/>
      </FadeWrapper>
    );
  }

  // is not activated the user group && status is initializing
  if (!isGroupActivated && state === stateMap.isInitializing) {
    const idToken = liff.liff.getIDToken();
    client.postAuth({ idToken }).then(({ data: user }) => {
      const hasGroupId = !!user.groupId;
      const isSameGroupId = user.groupId === sessionStorage.getItem('gid');
      const isProd = publicRuntimeConfig.NODE_ENV === 'production';
      setState(hasGroupId ? stateMap.isExistMember : stateMap.isNotExistMember);
      if (!hasPrepared || !hasGroupId) {
        // has not prepared yet
        dispatch(setUser({ picture: liff.user.pictureUrl, ...user }));
        return;
      }
      console.log('set gid and uid', user.groupId, user.id);
      sessionStorage.setItem('gid', user.groupId);
      sessionStorage.setItem('uid', user.id);
      dispatch(setUser({ picture: liff.user.pictureUrl, ...user }));
      if (isSameGroupId) {
        firebase.activateGroup(user.groupId);
        return;
      }
      if (!isProd) {
        // for debug. user groupId is different form session gid
        firebase.activateGroup(sessionStorage.getItem('gid') || user.groupId);
        return;
      }
      console.log('Remove session (member groupId is different from session gid', user.groupId, sessionStorage.getItem('gid'));
      sessionStorage.removeItem('uid');
      sessionStorage.removeItem('gid');
      liff.liff.logout();
    }).catch((err) => {
      console.error(err);
      setState(stateMap.hasError);
      sessionStorage.removeItem('uid');
      sessionStorage.removeItem('gid');
      liff.liff.logout();
    });
    return (
      <FadeWrapper>
        <Progress message="準備中。。。"/>
      </FadeWrapper>
    );
  }

  if (state === stateMap.isNotExistMember && !isLoginPage) {
    router.push(baseUri + '/login?redirectUri=' + redirectUri, undefined, {shallow: true});
    return (
      <>{children}</>
    );
  }

  if (state !== stateMap.isCompletedInitialize) {
    setState(stateMap.isCompletedInitialize);
  }

  if (!isGroupActivated) {
    firebase.activateGroup(sessionStorage.getItem('gid') || '');
  }

  return (
    <>{children}</>
  );
};

export default function MyApp(props: any) {
  const {Component, pageProps} = props;
  
  // use Google Analytics (track spa routing)
  useGA();

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>LifeManager🏠</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <AuthProvider>
        <FirebaseProvider>
          <Provider store={store}>
            <Layout>
              <CustomThemeProvider>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <Component {...pageProps} />
                <FooterV1 {...pageProps} />
              </CustomThemeProvider>
            </Layout>
          </Provider>
        </FirebaseProvider>
      </AuthProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
