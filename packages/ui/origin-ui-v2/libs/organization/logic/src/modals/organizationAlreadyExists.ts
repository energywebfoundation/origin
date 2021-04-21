// @should localize
import { TOrganizationAlreadyExistsLogic } from './types';

export const organizationAlreadyExistsLogic: TOrganizationAlreadyExistsLogic = (
  setOpen
) => {
  return {
    title: 'Sorry but this organization could not be registered.',
    text: [
      'There already exists an organization with the same information.',
      'Our support team will get in contact with you shortly to sort out the issue.',
    ],
    buttons: [{ label: 'Ok', onClick: () => setOpen(false) }],
  };
};
