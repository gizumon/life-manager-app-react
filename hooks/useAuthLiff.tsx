import { createContext, FC, useContext, useEffect, useState } from "react";
import Liff from '@line/liff';
import { IMember } from "../interfaces";
import getConfig from 'next/config';

const AuthContext = createContext<typeof Liff | undefined>(undefined);

export const AuthProvider: FC = ({ children }) => {
  const { publicRuntimeConfig } = getConfig();
  const liffId = publicRuntimeConfig.LIFF_ID;
  const [ liff, setLiff ] = useState<typeof Liff>();

  useEffect(() => {
    let unmounted = false;
    const func = async () => {
      const liff = (await import('@line/liff')).default;
      console.log('import liff');
      await liff.init({ liffId: liffId || ""});
      if (!unmounted) {
        setLiff(liff);
      }
    };
    func();
    const cleanup = () => {
      unmounted = true;
    };
    return cleanup;
  }, []);

  return (
    <AuthContext.Provider
      value={liff}
    >
      {children}
    </AuthContext.Provider>
  );
};

type IProfile = ReturnType<typeof Liff.getProfile> extends Promise<infer T> ? T : never;

type UseAuthReturn = {
  isInitialized: boolean;
  isLoggedIn: boolean;
  user?: IProfile;
  userId?: string;
  login: (obj?: {redirectUri: string}) => void;
  liff?: typeof Liff;
  sendText?: (message: string) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const liff = useContext(AuthContext);
  const [user, setUser] = useState<IProfile>();

  if (!liff) {
    return {
      isInitialized: false,
      isLoggedIn: false,
      login: () => {},
    };
  }

  if (liff.isLoggedIn() && !user) {
    liff.getProfile().then((u) => setUser(u));
  }

  return {
    isInitialized: true,
    isLoggedIn: liff.isLoggedIn(),
    login: liff.login,
    user: user,
    userId: liff.getContext()?.userId,
    liff: liff,
    sendText: (message: string) => liff.sendMessages([{
      type: 'text',
      text: message,
    }])
  };
};

export const makeMemberFromUser = (user: IProfile, groupId: string = '', id: string = ''): IMember => {
  return {
    id: id,
    name: user.displayName,
    lineId: user.userId,
    picture: user.pictureUrl,
    groupId: groupId,
  };
};
// export const useMessage = (): any => {
//   if (!liff) {
//     return {}
//   }
//   return
// }