import React, { FC } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../styles/theme';
import FooterV1 from '../components/FooterV1';
import { AuthProvider, useAuth } from '../hooks/useAuthLiff';
import { createStyles, Theme, CardMedia, Button } from '@material-ui/core';
import createStore from '../ducks/createStore';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
// import { FirebaseService } from '../services/firebaseService';
import { useRouter } from 'next/router';
import userSlice from '../ducks/user/slice';
import { UserState } from '../ducks/user/slice';
import { useFirebase, FirebaseProvider } from '../hooks/useFirebase';
import Progress from '../components/AnimationProgressV1';
import FadeWrapper from '../components/FadeWrapper';

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
      width: '100vw'
    },
    btn: {
      backgroundColor: '#00B900',
      color: 'white',
    }
  }),
);

const Layout: FC = ({ children }) => {
  const classes = useStyles();
  const router = useRouter();
  // const { isInitialized, isLoggedIn, login, liff } = useAuth();
  const liff = useAuth();
  const firebase = useFirebase();
  const dispatch = useDispatch();
  const redirectUri = process.env.ROOT_URL + router.asPath;

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
            {/* TODO: Fix complex button */}
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

  liff.liff?.getProfile().then(user => dispatch(userSlice.actions.setUser(user as UserState)));

  if (!firebase.isInitialized) {
    return (
      <FadeWrapper>
        <Progress />
      </FadeWrapper>
    );
  }

  return (
    <>{children}</>
  )
}

export default function MyApp(props: any) {
  const { Component, pageProps } = props;

  React.useEffect(() => {
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
          <Provider store={createStore()}>
            <Layout>
              <ThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <Component {...pageProps} />
                <FooterV1></FooterV1>
              </ThemeProvider>
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