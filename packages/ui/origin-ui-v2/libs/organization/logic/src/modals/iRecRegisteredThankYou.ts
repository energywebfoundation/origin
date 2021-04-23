// @should localize
import { TIRecRegisteredThankYouLogic } from './types';

export const IRecRegisteredThankYouLogic: TIRecRegisteredThankYouLogic = () => {
  return {
    title: 'Thank you for registering!',
    text: 'Your account is being approved.',
    buttons: [
      {
        label: 'Ok',
        onClick: () =>
          console.log('Should be redirect to default my organization'),
      },
    ],
  };
};
