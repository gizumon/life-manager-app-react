import FadeWrapper from '../components/FadeWrapper';
import Progress from '../components/AnimationProgressV1';
import { useAuth, makeMemberFromUser } from '../hooks/useAuthLiff';
import { useFirebase } from '../hooks/useFirebase';
import { useRouter } from 'next/router';
import Utils from '../services/utilsService';
import Card from '@material-ui/core/Card';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Button, CardContent, Divider, IconButton, TextField } from '@material-ui/core';
import { useState } from 'react';
import TapAndPlayIcon from '@material-ui/icons/TapAndPlay';
import SpeakerPhoneIcon from '@material-ui/icons/SpeakerPhone';
import ModalV1 from '../components/ModalV1';
import getConfig from 'next/config';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      minWidth: 300,
      maxWidth: 450,
      margin: '25px 25px 65px 25px',
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      marginTop: '1rem',
      marginBottom: '1rem',
    },
    block: {
      margin: '10px',
    },
    inputBtn: {
      marginTop: '4px',
      marginBottom: '4px',
    }
  }),
);

const stateMap = {
  isInitializing: 0,
  isFoundUser: 1,
  isNotFoundUser: 2,
};

/**
 * アクセス
 * 1. ログインのuserId情報からmember情報を取得
 * 2. memberを取得できた場合、memberのgroupIdを使って、リダイレクト
 * 3. memberを取得できなかった場合、新規ユーザー追加のフローへ
 * 
 * 新規ユーザー追加のフロー
 * 1. groupのコードを発行または入力させる画面を表示
 * 2. groupのコードを発行するユーザーは、コード発行。
 * 3. groupのコードを入力するユーザーは、コードを発行したユーザーのコードを入力。
 * 4. その後、groupIdとログイン情報をmembersへ追加し、リダイレクト
 * @returns 
 */
export default function Login() {
  const { publicRuntimeConfig } = getConfig();
  const router = useRouter();
  const { user, sendText } = useAuth();
  const { isInitialized, pushGroup, updateGroupMember, isExistGroup, updateMember, getMember } = useFirebase();
  const [ code, setCode ] = useState<string>();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [state, setState] = useState<number>(stateMap.isInitializing);
  const [onCloseFn, setOnCloseFn] = useState<() => void>(() => {});
  const classes = useStyles();
  const redirectUri = router.query['redirectUri'] as string
                   || Utils.getQueryParam(router.asPath, 'redirectUri')
                   || publicRuntimeConfig.ROOT_URL + '/input?type=pay';
  const groupId = sessionStorage.getItem('gid')

  const onChangeHandler = (event: any) => setCode(event.target.value);
  const onCloseModalHandler = () => {
    setIsOpenModal(false);
    setModalMessage('');
    onCloseFn();
  }

  const modalOn = (message: string, fn: () => void = () => {}) => {
    setModalMessage(message);
    // TODO: should detect onclose and should useModal
    setOnCloseFn(() => fn);
    setIsOpenModal(true);
  };

  const redirectWithLogin = (url: string, groupId: string = '') => {
    sessionStorage.setItem('gid', groupId);
    router.push(url, undefined, {shallow: true});
  };

  if (groupId) {
    redirectWithLogin(redirectUri, groupId);
  }

  const generateCode = () => {
    if (user && updateMember && pushGroup && updateGroupMember) {
      const newMember = makeMemberFromUser(user);
      pushGroup().then(ref => {
        if (ref.key === null) {
          console.error('push group does not success', ref);
          modalOn('Groupの作成に失敗しました。。')
          return;
        }
        newMember.groupId = ref.key;
        updateGroupMember(newMember.groupId, newMember);
        updateMember(user.userId, newMember).then((_) => {
          // TODO: should ¥n
          const message = `ペアリングしたいユーザーへ下記のコードを共有ください。　ペアリングコード：「${newMember.groupId}」`; 
          try {
            // TODO: Should avoid error
            (sendText as (message: string) => void)(message);
          } catch {
            console.warn('Could not send text using liff', message);
          }
          modalOn(message, () => {
            // TODO: should detect onclose and should useModal
            redirectWithLogin(redirectUri, newMember.groupId);
            setOnCloseFn(() => {});
          });
        });
      });
    } else {
      console.warn('firebase need to initialize...');
    }
  }

  const applyCode = () => {
    if (!code) {
      return modalOn('ペアリングコードが入力されていません');
    }
    if (user && updateGroupMember && updateMember && isExistGroup) {
      isExistGroup(code)?.then(isExist => {
        if (!isExist) {
          return modalOn(`入力されたペアリングコードは正しくないみたいです。。`);
        }
        const newMember = makeMemberFromUser(user);
        newMember.groupId = code;
        updateGroupMember(newMember.groupId as string, newMember).then(_ => {
          updateMember(user.userId, newMember).then((_) => {
            redirectWithLogin(redirectUri, newMember.groupId);
          });
        });
      });
    }
  }

  // user is exist in auth, but not in member.
  if (user && isInitialized) {
    // no request when already check user open
    if (getMember && state === stateMap.isInitializing) {
      getMember(user.userId).then(member => {
        if (member) {
          redirectWithLogin(redirectUri, member.groupId);
        }
        setState(member ? stateMap.isFoundUser : stateMap.isNotFoundUser);
      });
    }
    if (state === stateMap.isNotFoundUser) {
      return (
        <>
          <Card className={classes.card}>
            <CardContent>
              <span>共有されたペアリングコードがある場合：</span>
              <div className={classes.block}>
                <TextField
                  id="code"
                  label="ペアリングコード入力"
                  variant="outlined"
                  type="text"
                  margin="dense"
                  onChange={onChangeHandler}
                />
                <IconButton className={classes.inputBtn} color="primary" onClick={applyCode} >
                  <TapAndPlayIcon />
                </IconButton>
              </div>
              <Divider className={classes.divider} orientation="horizontal" />
              <span>ペアリングコードを持っていない場合：</span>
              <div className={classes.block}>
                <Button  variant="contained" color="primary" onClick={generateCode} endIcon={<SpeakerPhoneIcon />}>ペアリングコード発行</Button>
              </div>
            </CardContent>
          </Card>
          <ModalV1 open={isOpenModal} title='' body={modalMessage} onClose={onCloseModalHandler} />
        </>
      );
    }
  }

  const message = state === stateMap.isInitializing ? "ログイン中。。。"
                : state === stateMap.isFoundUser ? "ユーザー確認中。。。"
                : "ユーザーが見つかりませんでした。。。";
  return <FadeWrapper><Progress message={message}/></FadeWrapper>;
}

// function makeRedirectUri(redirectUri: string, groupId: string = ''): string {
//   const hasQuery = redirectUri.indexOf('?') > -1;
//   const id = groupId ? `id=${groupId}` : '';
//   const suffix = !id ? ''
//                      : `${hasQuery ? '&' : '?'}${id}`;
//   return redirectUri + suffix;
// }
