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
import ModalV1, { useModal, IUseModal } from '../components/common/ModalV1';
import { useUserState } from '../ducks/user/selector';

type IModalSetObj = {
  modalSetObj: Pick<IUseModal, 'setIsOpen' | 'setMessage' | 'setFuncObj'>;
}

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

// TODO: Should refactor (Make it more simple)
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
const Layout: FC<IModalSetObj> = ({ children, modalSetObj }) => {
  const classes = useStyles();
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  // const { isInitialized, isLoggedIn, login, liff } = useAuth();
  const liff = useAuth();
  const firebase = useFirebase();
  const { isInitialized, isGroupActivated } = useSelector<StoreState, FirebaseState>((state) => state.firebase);
  const dispatch = useDispatch();
  const { user } = useUserState();
  const [ state, setState ] = useState<number>(stateMap.isInitializing);
  const baseUri = publicRuntimeConfig.ROOT_URL;
  const redirectUri = baseUri + router.asPath;
  const isLoginPage = router.asPath.indexOf('/login') > -1;
  const hasPrepared = !!firebase.activateGroup;

  useEffect(() => {
    if ((!user || !user.groupId) && !isLoginPage) {
      router.push(baseUri + '/login?redirectUri=' + redirectUri, undefined, {shallow: true});
    }
  }, [user.groupId]);

  // line is not ready
  if (!liff.isInitialized) {
    return (
      <FadeWrapper>
        <Progress />
      </FadeWrapper>
    );
  }

  // user not logged in
  if (!liff.isLoggedIn) {
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
      setState(hasGroupId ? stateMap.isExistMember : stateMap.isNotExistMember);
      if (!hasPrepared || !hasGroupId) {
        // has not prepared yet
        dispatch(setUser({ ...user }));
        return;
      }

      console.log('set gid and uid', user.groupId, user.id);
      dispatch(setUser({ ...user }));
      firebase.activateGroup(user.groupId);
      return;
    }).catch((err) => {
      console.error(err);
      liff.liff.logout();
    });
    return (
      <FadeWrapper>
        <Progress message="初期化中。。。"/>
      </FadeWrapper>
    );
  }

  if (state === stateMap.isNotExistMember && !isLoginPage) {
    router.push(baseUri + '/login?redirectUri=' + redirectUri, undefined, {shallow: true});
    return (
      <FadeWrapper>
        <Progress message="ログインページへ遷移します💨"/>
      </FadeWrapper>
    );
  }

  if (state !== stateMap.isCompletedInitialize) {
    setState(stateMap.isCompletedInitialize);
  }

  // TODO: required?
  if (!isGroupActivated) {
    firebase.activateGroup(user.groupId);
  }

  return (
    <>{children}</>
  );
};

export default function MyApp(props: any) {
  const {Component, pageProps} = props;
  const {isOpen, message, funcObj, setIsOpen, setMessage, setFuncObj} = useModal();
  
  const modalSetObj = { setIsOpen, setMessage, setFuncObj };

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
            <Layout modalSetObj={modalSetObj}>
              <CustomThemeProvider>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <Component {...pageProps} />
                <FooterV1 {...pageProps} />
              </CustomThemeProvider>
            </Layout>
            <ModalV1 open={isOpen} title='' body={message} onClose={funcObj.fn} />
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
