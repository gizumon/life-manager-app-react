import FadeWrapper from '../components/common/FadeWrapper';
import Progress from '../components/common/AnimationProgressV1';
import {useAuth, makeMemberFromUser} from '../hooks/useAuthLiff';
import {useFirebase} from '../hooks/useFirebase';
import {useRouter} from 'next/router';
import Utils from '../services/utils';
import Card from '@material-ui/core/Card';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import {Button, CardContent, Divider, IconButton, TextField} from '@material-ui/core';
import {useState} from 'react';
import TapAndPlayIcon from '@material-ui/icons/TapAndPlay';
import SpeakerPhoneIcon from '@material-ui/icons/SpeakerPhone';
import ModalV1 from '../components/common/ModalV1';
import getConfig from 'next/config';
import { useUserState } from '../ducks/user/selector';
import InternalAPI from '../services/api';

const client = new InternalAPI();

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
    },
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
  const {publicRuntimeConfig} = getConfig();
  const router = useRouter();
  const { user: lineUser, sendText } = useAuth();
  const { user } = useUserState();
  const {isInitialized, pushGroup, getGroupMember, updateGroupMember, isExistGroup} = useFirebase();
  const [code, setCode] = useState<string>();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [state, setState] = useState<number>(stateMap.isInitializing);
  const [onCloseFn, setOnCloseFn] = useState<{fn: () => void }>({fn: () => {}});
  const classes = useStyles();
  const redirectUri = router.query['redirectUri'] as string ||
                      Utils.getQueryParam(router.asPath, 'redirectUri') ||
                      publicRuntimeConfig.ROOT_URL + '/input?type=pay';

  const onChangeHandler = (event: any) => setCode(event.target.value);
  const onCloseModalHandler = () => {
    setIsOpenModal(false);
    setModalMessage('');
    onCloseFn.fn();
  };

  const modalOn = (message: string, closeFn = () => {}) => {
    setModalMessage(message);
    // TODO: should detect onclose and should useModal
    setOnCloseFn({fn: closeFn});
    setIsOpenModal(true);
  };

  const redirectWithLogin = (url: string, groupId: string = '') => {
    router.push(url, undefined, {shallow: true});
  };

  if (user.groupId) {
    // login
    redirectWithLogin(redirectUri, user.groupId);
    return <FadeWrapper><Progress message={'リダイレクトします。。。'}/></FadeWrapper>;
  }

  const generateCode = () => {
    if (!user || !updateGroupMember || !isExistGroup) {
      return modalOn('初期化に失敗しました再度ログインお試しください');
    }

    const newMember = { ...user };
    pushGroup().then((ref) => {
      if (ref.key === null) {
        console.error('push group does not success', ref);
        modalOn('Groupの作成に失敗しました。。');
        return;
      }
      newMember.groupId = ref.key;
      updateGroupMember(newMember.groupId, newMember).catch(e => {
        modalOn('グループメンバーの更新に失敗しました。。。\n\n' + JSON.stringify(e));
      });
      client.postUser(newMember).then((_) => {
        let message = `ペアリングしたいユーザーへ下記のコードを共有ください🙇‍♂️\nペアリングコード：\n\n${newMember.groupId}`;
        sendText(message).then(() => {
          modalOn('ペアリングコードをチャットに送信しました👍\nペアリングしたいユーザーに送信ください😉', () => {
            redirectWithLogin(redirectUri, newMember.groupId);
            setOnCloseFn({ fn: () => {} });
          });  
        }).catch((e) => {
          console.warn('Could not send text using liff', e);
          modalOn(message, () => {
            redirectWithLogin(redirectUri, newMember.groupId);
            setOnCloseFn({ fn: () => {} });
          });
        });
      }).catch((e) => {
        modalOn('ユーザーの更新に失敗しました。。。\n\n' + JSON.stringify(e));
      });
    }).catch(e => {
      modalOn('グループの追加に失敗しました。。。\n\n' + JSON.stringify(e));
    });
  };

  const applyCode = () => {
    if (!code) {
      return modalOn('ペアリングコードが入力されていません🙅‍♂️');
    }
    if (!user || !updateGroupMember || !isExistGroup) {
      return modalOn('初期化に失敗しました再度ログインお試しください🙇‍♂️');
    }
    isExistGroup(code)?.then((isExist) => {
      if (!isExist) {
        return modalOn(`入力されたペアリングコードは正しくないみたいです。。`);
      }
      const newMember = { ...user };
      newMember.groupId = code;
      updateGroupMember(newMember.groupId as string, newMember).then((_) => {
        client.postUser(newMember).then((_) => {
          return modalOn(`ペアリングに成功しました🎉\n引き続きご利用宜しくお願いします👼`, () => {
            redirectWithLogin(redirectUri, newMember.groupId);
          });
        }).catch(e => {
          console.error(e);
          return modalOn(`ごめんなさい！！ユーザーの追加に失敗しました🙇‍♂️お手数ですが、お問い合わせ下さい🙇‍♂️`);
        });
      });
    });
  };

  // user is exist in auth, but not in member.
  if (lineUser && user && isInitialized) {
    // should not request when already check user was opened
    const { id, picture, groupId } = user;

    if (!groupId) {
      // not found user
      return (
        <>
          <Card className={classes.card}>
            <CardContent>
              <span>共有されたペアリングコードをお持ちの場合(グループに参加)：</span>
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
              <span>ペアリングコードを持っていない場合(グループを作成)：</span>
              <div className={classes.block}>
                <Button variant="contained" color="primary" onClick={generateCode} endIcon={<SpeakerPhoneIcon />}>ペアリングコード発行</Button>
              </div>
            </CardContent>
          </Card>
          <ModalV1 open={isOpenModal} title='' body={modalMessage} onClose={onCloseModalHandler} />
        </>
      );
    }
    // user found
    getGroupMember(groupId, id).then((member) => {
      setState(member ? stateMap.isFoundUser : stateMap.isNotFoundUser);
      const isSameImage = picture === member?.picture;
      if (member && !isSameImage) {
        updateGroupMember(groupId, { id, picture });
      }

      if (member) {
        redirectWithLogin(redirectUri, member.groupId);
      }
    }).catch((e) => {
      console.error(e);
      modalOn(JSON.stringify(e));
    });
  }

  const message = state === stateMap.isInitializing ? 'ログイン中。。。' :
                  state === stateMap.isFoundUser ? 'ユーザー確認中。。。' :
                  'ユーザーが見つかりませんでした。。。';
  return <FadeWrapper><Progress message={message}/></FadeWrapper>;
}

// function makeRedirectUri(redirectUri: string, groupId: string = ''): string {
//   const hasQuery = redirectUri.indexOf('?') > -1;
//   const id = groupId ? `id=${groupId}` : '';
//   const suffix = !id ? ''
//                      : `${hasQuery ? '&' : '?'}${id}`;
//   return redirectUri + suffix;
// }
