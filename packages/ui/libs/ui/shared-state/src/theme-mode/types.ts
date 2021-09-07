import { ThemeModeEnum } from './ThemeModeEnum';

export type TSaveThemeModeToLS = (mode: ThemeModeEnum) => void;

export type TGetThemeModeFromLS = () => ThemeModeEnum;
