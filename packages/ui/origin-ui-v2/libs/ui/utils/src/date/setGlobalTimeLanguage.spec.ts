import { setGlobalTimeLanguage } from './setGlobalTimeLanguage';
import dayjs from 'dayjs';

describe('setGlobalTimeLanguage', function () {
  it('should set global date locale to Polish', function () {
    setGlobalTimeLanguage();
    expect(dayjs().format()).toMatchInlineSnapshot();
  });
});
