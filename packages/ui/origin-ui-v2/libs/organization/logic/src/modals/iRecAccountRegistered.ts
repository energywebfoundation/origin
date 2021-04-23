// @should localize
import { TIRecAccountRegisteredLogic } from './types';

export const iRecAccountRegisteredLogic: TIRecAccountRegisteredLogic = () => {
  return {
    title: 'Thank you for registering an I-REC account!',
    text:
      'We will forward your application to I-REC and inform you as soon as it is approved.',
    buttons: [
      {
        label: 'Ok',
        onClick: () =>
          console.log(
            'Should close this modal, show notification and open another'
          ),
      },
    ],
  };
};
