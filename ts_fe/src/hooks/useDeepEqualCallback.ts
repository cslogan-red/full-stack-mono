import { dequal } from 'dequal';
import { useCallback, useRef, type DependencyList } from 'react';

// deepEqualCallback is a custom hook that returns a memoized callback function
export const useDeepEqualCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: DependencyList,
) => {
  const prevDependencies = useRef<DependencyList>(dependencies);
  const areDeepsEqual = dequal(prevDependencies.current, dependencies);
  if (!areDeepsEqual) {
    prevDependencies.current = dependencies;
  }

  return useCallback(callback, prevDependencies.current);
};
