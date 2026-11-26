import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { DEFAULT_AUDIO_SETTINGS } from '../services/audio/audio.config';
import { AppSettings, CaseType, CrimeCase, Game, GameStatus } from '../types';

const defaultSettings: AppSettings = {
  soundSettings: DEFAULT_AUDIO_SETTINGS,
  apiKeys: [],
};

const defaultGame: Game = {
  crimeCase: undefined,
  status: 'menu',
  settings: defaultSettings,
  availableTokens: 5,
  spentTokens: 0,
  elapsedTime: 0,
  startNewCase: async () => { },
  askSuspect: async () => '',
  accuseSuspect: async () => false,
  clearCase: async () => { },
  updateSettings: async () => { },
};

const GameContext = createContext<Game>(defaultGame);

interface GameProviderProps {
  children: React.ReactNode;
}

/**
 * Provedor global do estado do jogo.
 * Mantém o estado e expõe as ações para todas as telas via `useGame()`.
 */
export function GameProvider({ children }: GameProviderProps) {

  const [crimeCase, setCrimeCase] = useState<CrimeCase | undefined>(undefined);
  const [status, setStatus] = useState<GameStatus>('menu');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [availableTokens, setAvailableTokens] = useState<number>(5);
  const [spentTokens, setSpentTokens] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const startNewCase = useCallback(
    async (_preferredType?: CaseType) => {
      // TODO: Gerar novo caso via serviço de IA, atualizar estado e persistir localmente.
      setStatus('em_andamento');
      setAvailableTokens(5);
      setSpentTokens(0);
      setElapsedTime(0);
    }, []
  );

  const askSuspect = useCallback(
    async (_suspectId: string, _question: string): Promise<string> => {
      // TODO: Enviar pergunta ao serviço de IA, atualizar histórico e persistir.
      return '';
    },
    [],
  );

  const accuseSuspect = useCallback(
    async (suspectId: string): Promise<boolean> => {

      // TODO: Validar acusação , atualizar status e persistir.

      const isCulprit = crimeCase?.culprit?.id === suspectId;

      setStatus(isCulprit ? 'vitoria' : 'derrota');
      return isCulprit;
    },
    [crimeCase],
  );

  const clearCase = useCallback(
    async () => {
      // TODO: Limpar caso persistido no armazenamento local.
      setCrimeCase(undefined);
      setStatus('menu');
      setAvailableTokens(5);
      setSpentTokens(0);
      setElapsedTime(0);
    },
    []
  );

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      // TODO: Persistir configurações
      setSettings(prev => ({
        ...prev,
        ...partial,
      }));
    },
    []
  );

  const value = useMemo<Game>(
    () => ({
      crimeCase,
      status,
      settings,
      availableTokens,
      spentTokens,
      elapsedTime,
      startNewCase,
      askSuspect,
      accuseSuspect,
      clearCase,
      updateSettings,
    }),
    [
      crimeCase,
      status,
      settings,
      availableTokens,
      spentTokens,
      elapsedTime,
      startNewCase,
      askSuspect,
      accuseSuspect,
      clearCase,
      updateSettings,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): Game {
  return useContext(GameContext);
}
