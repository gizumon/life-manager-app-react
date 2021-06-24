import { DependencyList, EffectCallback, useEffect, useRef } from "react";

export const useUpdateEffect = (effect: EffectCallback, deps: DependencyList) => {
  const firstFlgRef = useRef(true);

  useEffect(() => {
    if (!firstFlgRef.current) {
      effect();
    } else {
      firstFlgRef.current = false;
    }
  }, deps);
};
