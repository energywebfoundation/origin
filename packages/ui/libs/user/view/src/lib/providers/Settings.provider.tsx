import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type SettingsProviderProps = {
  children: ReactNode;
  initialState?: ISettingsContextState;
};
interface ISettingsContextState {
  locale: 'en' | 'pl';
}

type Dispatch = (newContextState: ISettingsContextState) => void;

const SettingsContext = createContext<ISettingsContextState>(null);
const SettingsDispatchContext = createContext<Dispatch | null>(null);

const SettingsProvider = ({
  children,
  initialState,
}: SettingsProviderProps) => {
  const [settings, setSettings] = useState(initialState);

  useEffect(() => {
    return () => {};
  }, [settings]);

  return (
    <SettingsContext.Provider value={settings}>
      <SettingsDispatchContext.Provider value={setSettings}>
        {children}
      </SettingsDispatchContext.Provider>
    </SettingsContext.Provider>
  );
};

const useSettings = (): ISettingsContextState => {
  return useContext<ISettingsContextState>(SettingsContext);
};

const useSettingsDispatch = (): Dispatch => {
  const context = useContext<Dispatch | null>(SettingsDispatchContext);

  if (context === null) {
    throw new Error(
      '*useSettingsDispatch* must be used within a *SettingsProvider*'
    );
  }
  return context;
};

export { SettingsProvider, useSettings, useSettingsDispatch };
