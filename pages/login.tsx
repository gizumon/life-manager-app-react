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
import { IMember } from '../interfaces/index';
import TapAndPlayIcon from '@material-ui/icons/TapAndPlay';
import SpeakerPhoneIcon from '@material-ui/icons/SpeakerPhone';
import ModalV1 from '../components/ModalV1';

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
  const router = useRouter();
  const { userId, user, sendText } = useAuth();
  const { isInitialized, members, pushMember, pushGroup, pushGroupMember, isExistGroup } = useFirebase();
  const [ code, setCode ] = useState<string>();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [onCloseFn, setOnCloseFn] = useState<() => void>(() => {});
  const classes = useStyles();

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
  const generateCode = () => {
    if (user && pushMember && pushGroup) {
      const newMember = makeMemberFromUser(user);
      pushGroup().then(ref => {
        if (ref.key === null) {
          console.error('push group does not success', ref);
          modalOn('Groupの作成に失敗しました。。')
          return;
        }
        newMember.groupId = ref.key;
        pushMember(newMember).then((_) => {
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
            router.push(makeRedirectUri(redirectUri, newMember.groupId), undefined, {shallow: true});
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
    if (user && pushGroupMember && pushMember && isExistGroup) {
      const newMember = makeMemberFromUser(user);
      newMember.groupId = code;
      isExistGroup(newMember.groupId)?.then(isExist => {
        if (!isExist) {
          return modalOn(`入力されたペアリングコードは正しくないみたいです。。`);
        }
        pushGroupMember(newMember.groupId as string, newMember).then(_ => {
          pushMember(newMember).then((_) => {
            router.push(makeRedirectUri(redirectUri, newMember.groupId), undefined, {shallow: true});
          });
        });
      });
    }
  }

  const member = members?.find((item) => item.lineId === userId);
  const redirectUri = router.query['redirectUri'] as string
                   || Utils.getQueryParam(router.asPath, 'redirectUri')
                   || process.env.ROOT_URL + '/input?type=pay';

  const hasMemberBelongGroup = member && member.groupId;

  // member is already exist, 
  if (hasMemberBelongGroup && isInitialized) {
    const url = makeRedirectUri(redirectUri, (member as IMember).groupId);
    console.log('Make redirect URI', url)
    router.push(url, undefined, {shallow: true});
    return <FadeWrapper><Progress message="ページ移動中。。。"/></FadeWrapper>
  }

  // user is exist in auth, but not in member.
  if (!hasMemberBelongGroup && user && isInitialized) {
    console.log('code input: ', member, user);
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

  console.log('Preparing...', userId, member, user);
  return <FadeWrapper><Progress message="準備中。。。"/></FadeWrapper>;
}

function makeRedirectUri(redirectUri: string, groupId: string = ''): string {
  const hasQuery = redirectUri.indexOf('?') > -1;
  const id = groupId ? `id=${groupId}` : '';
  const suffix = !id ? ''
                     : `${hasQuery ? '&' : '?'}${id}`;
  return redirectUri + suffix;
}
