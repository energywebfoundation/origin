// @should localize
import { TRegisterThankYouLogic } from './types';

export const registerThankYouLogic: TRegisterThankYouLogic = () => {
  return {
    title: 'Thank you for registering!',
    text:
      'Your registration is reviewed by the platform administrator and you will be notified when your account is activated.',
    buttons: [
      {
        label: 'Ok',
        onClick: () =>
          console.log('Here should be func to navigate to default page'),
      },
    ],
  };
};
