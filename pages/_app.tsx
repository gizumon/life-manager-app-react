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
};

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

  if (!liff.isInitialized) {
    return (
      <FadeWrapper>
        <Progress />
      </FadeWrapper>
    );
  }

  if (!liff.isLoggedIn) {
    return (
      <FadeWrapper>
        <div className={classes.root}>
          <CardMedia
            className={classes.media}
            image="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
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

  if (!isInitialized || !hasPrepared) {
    return (
      <FadeWrapper>
        <Progress message="準備中。。。"/>
      </FadeWrapper>
    );
  }

  // TODO: Can you login without activate group?
  if (!isGroupActivated && state === stateMap.isInitializing) {
    firebase.getMember(liff.userId as string).then((member) => {
      const isExistMember = !!member;
      const hasGoupId = !!member.groupId;
      const isSameGroupId = member.groupId === sessionStorage.getItem('gid');
      const isProd = publicRuntimeConfig.NODE_ENV === 'production';
      setState(isExistMember ? stateMap.isExistMember : stateMap.isNotExistMember);
      if (!isExistMember || !hasPrepared || !hasGoupId) {
        // has not prepared yet
        return;
      }
      if (isSameGroupId) {
        if (!!liff.user && !!liff.user.pictureUrl && member.picture !== liff.user.pictureUrl) {
          firebase.updateGroupMember(member.groupId, {picture: liff.user.pictureUrl});
        }
        firebase.activateGroup(member.groupId);
        return;
      }
      // member groupId is different form session gid
      if (!isProd) {
        firebase.activateGroup(sessionStorage.getItem('gid') || member.groupId);
        return;
      }
      console.log('Remove session (member groupId is different from session gid', member.groupId, sessionStorage.getItem('gid'));
      sessionStorage.removeItem('gid');
    });
  }

  if (state === stateMap.isNotExistMember && !isLoginPage) {
    router.push(baseUri + '/login?redirectUri=' + redirectUri, undefined, {shallow: true});
  }

  if (state !== stateMap.isCompletedInitialize) {
    dispatch(setUser(liff.user as UserState));
    sessionStorage.setItem('uid', liff.userId || '');
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
