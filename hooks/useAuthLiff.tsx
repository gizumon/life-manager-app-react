import { createContext, FC, useContext, useEffect, useState } from "react"
import Liff from '@line/liff'

const AuthContext = createContext<typeof Liff | undefined>(undefined);

export const AuthProvider: FC = ({ children }) => {

  const [liff, setLiff] = useState<typeof Liff>();

  useEffect(() => {
    let unmounted = false;
    const func = async () => {
      const liff = (await import('@line/liff')).default;
      console.log('import liff');
      // TODO: Use process env
      await liff.init({ liffId: process.env.LIFF_ID || '1655623367-dEnwWVRZ' });
      if (!unmounted) {
        setLiff(liff);
      }
    }
    func();
    const cleanup = () => {
      unmounted = true;
    }
    return cleanup;
  }, []);


  return (
    <AuthContext.Provider
      value={liff}
    >
      {children}
    </AuthContext.Provider>
  )
}

type UseAuthReturn = {
  isInitialized: boolean;
  isLoggedIn: boolean;
  userId?: string;
  login: (obj?: {redirectUri: string}) => void;
  liff?: typeof Liff;
}

export const useAuth = (): UseAuthReturn => {
  const liff = useContext(AuthContext);

  if (!liff) {
    return {
      isInitialized: false,
      isLoggedIn: false,
      login: () => {},
    };
  }

  return {
    isInitialized: true,
    isLoggedIn: liff.isLoggedIn(),
    login: liff.login,
    userId: liff.getContext()?.userId,
    liff: liff,
  };
}

// export const useMessage = (): any => {
//   if (!liff) {
//     return {}
//   }
//   return
// }