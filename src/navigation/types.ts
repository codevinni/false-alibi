import { CrimeCase, Game, GameStatus, Suspect } from '../types';

export type RouteName =
  | 'HomeScreen'
  | 'SettingsScreen'
  | 'BriefingScreen'
  | 'SuspectsScreen'
  | 'InterrogationScreen'
  | 'HistoryScreen'
  | 'ResultScreen'
  | 'Home'
  | 'Settings'
  | 'Briefing'
  | 'Suspects'
  | 'Interrogation'
  | 'History'
  | 'Result';

export type InvestigationResult = 'victory' | 'defeat';

export interface BriefingRouteParams {
  crimeCase?: CrimeCase;
  game?: Game;
}

export interface SuspectsRouteParams {
  crimeCase?: CrimeCase;
  game?: Game;
}

export interface InterrogationRouteParams {
  suspect: Suspect;
  crimeCase?: CrimeCase;
  game?: Game;
}

export interface HistoryRouteParams {
  suspect: Suspect;
  crimeCase?: CrimeCase;
  game?: Game;
}

export interface ResultRouteParams {
  result: InvestigationResult;
  status?: GameStatus;
  accusedSuspect?: Suspect;
  crimeCase?: CrimeCase;
  game?: Game;
}

export type RootStackParamList = {
  HomeScreen: undefined;
  SettingsScreen: undefined;
  BriefingScreen: BriefingRouteParams | undefined;
  SuspectsScreen: SuspectsRouteParams | undefined;
  InterrogationScreen: InterrogationRouteParams;
  HistoryScreen: HistoryRouteParams;
  ResultScreen: ResultRouteParams;
  Home: undefined;
  Settings: undefined;
  Briefing: BriefingRouteParams | undefined;
  Suspects: SuspectsRouteParams | undefined;
  Interrogation: InterrogationRouteParams;
  History: HistoryRouteParams;
  Result: ResultRouteParams;
};

export interface RouteEntry<
  T extends keyof RootStackParamList = keyof RootStackParamList,
> {
  name: T;
  params?: RootStackParamList[T];
}

export interface NavigationProp {
  currentRoute: RouteEntry;
  navigate: <T extends keyof RootStackParamList>(
    ...args: undefined extends RootStackParamList[T]
      ? [name: T, params?: RootStackParamList[T]]
      : [name: T, params: RootStackParamList[T]]
  ) => void;
  replace: <T extends keyof RootStackParamList>(
    ...args: undefined extends RootStackParamList[T]
      ? [name: T, params?: RootStackParamList[T]]
      : [name: T, params: RootStackParamList[T]]
  ) => void;
  reset: <T extends keyof RootStackParamList>(
    name: T,
    params?: RootStackParamList[T],
  ) => void;
  goBack: () => void;
  canGoBack: () => boolean;
}

export interface ScreenProps<
  T extends keyof RootStackParamList = keyof RootStackParamList,
> {
  navigation?: NavigationProp;
  route?: RouteEntry<T>;
}
