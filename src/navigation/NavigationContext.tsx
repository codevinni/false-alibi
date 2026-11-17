import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BackHandler } from 'react-native';
import {
  NavigationProp,
  RootStackParamList,
  RouteEntry,
} from './types';

const defaultNavigation: NavigationProp = {
  currentRoute: { name: 'HomeScreen', params: undefined },
  navigate: () => {},
  replace: () => {},
  reset: () => {},
  goBack: () => {},
  canGoBack: () => false,
};

const NavigationContext = createContext<NavigationProp>(defaultNavigation);

interface NavigationProviderProps {
  initialRouteName?: keyof RootStackParamList;
  children: React.ReactNode;
}

export function NavigationProvider({
  initialRouteName = 'HomeScreen',
  children,
}: NavigationProviderProps) {
  const [history, setHistory] = useState<RouteEntry[]>([
    { name: initialRouteName, params: undefined },
  ]);

  const currentRoute = history[history.length - 1];

  const navigate = useCallback(
    <T extends keyof RootStackParamList>(
      name: T,
      params?: RootStackParamList[T],
    ) => {
      setHistory(prev => [...prev, { name, params }]);
    },
    [],
  );

  const replace = useCallback(
    <T extends keyof RootStackParamList>(
      name: T,
      params?: RootStackParamList[T],
    ) => {
      setHistory(prev => [
        ...prev.slice(0, Math.max(0, prev.length - 1)),
        { name, params },
      ]);
    },
    [],
  );

  const reset = useCallback(
    <T extends keyof RootStackParamList>(
      name: T,
      params?: RootStackParamList[T],
    ) => {
      setHistory([{ name, params }]);
    },
    [],
  );

  const goBack = useCallback(() => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const canGoBack = useCallback(() => history.length > 1, [history.length]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (history.length > 1) {
          setHistory(prev => prev.slice(0, -1));
          return true;
        }
        return false;
      },
    );

    return () => subscription.remove();
  }, [history.length]);

  const value = useMemo<NavigationProp>(
    () => ({
      currentRoute,
      navigate: navigate as NavigationProp['navigate'],
      replace: replace as NavigationProp['replace'],
      reset,
      goBack,
      canGoBack,
    }),
    [currentRoute, navigate, replace, reset, goBack, canGoBack],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationProp {
  return useContext(NavigationContext);
}

export function useRoute<
  T extends keyof RootStackParamList = keyof RootStackParamList,
>(): RouteEntry<T> {
  const { currentRoute } = useNavigation();
  return currentRoute as RouteEntry<T>;
}
