import {
  OrganizationStatus,
  UserDTO,
} from '@energyweb/origin-backend-react-query-client';
import {
  RegistrationDTO,
  ShortConnectionDTO,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import {
  usePermissionsLogic,
  IPermissionReturnType,
  Requirement,
} from '../permissions';

type CreateBeneficiariesPermissionsArgs = {
  user: UserDTO | undefined;
  iRecOrg: RegistrationDTO | undefined;
  iRecConnection: ShortConnectionDTO | undefined;
};

export const useCreateBeneficiariesPermissionsLogic = ({
  user,
  iRecOrg,
  iRecConnection,
}: CreateBeneficiariesPermissionsArgs): IPermissionReturnType => {
  const requirementList: Requirement[] = [
    Requirement.HasActiveOrganization,
    ...(process.env.NODE_ENV !== 'development'
      ? [Requirement.HasIRecApiConnection, Requirement.HasIRecOrg]
      : []),
  ];

  const permissions = usePermissionsLogic({
    hasActiveOrg: user?.organization?.status === OrganizationStatus.Active,
    hasIRecOrg: Boolean(iRecOrg),
    iRecConnectionActive: iRecConnection?.active,
    config: requirementList,
  });

  return {
    ...permissions,
  };
};
