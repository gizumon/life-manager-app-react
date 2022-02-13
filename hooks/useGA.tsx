import { existsGaId, pageView } from "../services/gtag";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const useGA = () => {
  const router = useRouter();
  useEffect(() => {
    if (!existsGaId) return;
  
    const handleRouteChange = (url: string) => {
      pageView(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
};
