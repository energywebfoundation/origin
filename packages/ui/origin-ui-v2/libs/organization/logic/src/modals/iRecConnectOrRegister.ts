// @should localize
import { TIRecConnectOrRegisterLogic } from './types';

export const iRecConnectOrRegisterLogic: TIRecConnectOrRegisterLogic = (
  setOpen
) => {
  return {
    title: 'Thank you for registering an organization on the marketplace!',
    text: [
      'We are checking your information as soon as possible and will contact you once everything is approved and you can start trading.',
      'In order to register devices and request I-RECs, users also need to connect an I-REC account.',
    ],
    buttons: [
      { label: 'Not now', onClick: () => setOpen(false), variant: 'outlined' },
      {
        label: 'Register New I-REC account',
        onClick: () => console.log('Navigate to register I-Rec'),
      },
    ],
  };
};
