import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Check, Clear } from '@material-ui/icons';
import {
    IOrganization,
    OrganizationInvitationStatus,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';

import { showNotification, NotificationType } from '../../utils/notifications';
import { TableMaterial } from '../Table/TableMaterial';
import { setLoading } from '../../features/general/actions';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../Table/PaginatedLoaderHooks';
import { getOffChainDataSource } from '../../features/general/selectors';
import { refreshUserOffchain } from '../../features/users/actions';

interface IRecord {
    organization: IOrganization;
    invitation: IOrganizationInvitation;
}

function getOrganizationInvitationStatusText(status: OrganizationInvitationStatus) {
    if (status === OrganizationInvitationStatus.Accepted) {
        return 'Accepted';
    }

    if (status === OrganizationInvitationStatus.Rejected) {
        return 'Rejected';
    }

    return 'Pending';
}

interface IProps {
    email?: string;
    organizationId?: number;
}

export function OrganizationInvitationTable(props: IProps) {
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;

    const dispatch = useDispatch();

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!organizationClient) {
            return {
                paginatedData: [],
                total: 0
            };
        }

        let invitations: IOrganizationInvitation[] = [];

        if (props.email) {
            invitations = await organizationClient.getInvitationsForEmail(props.email);
        } else if (props.organizationId) {
            invitations = await organizationClient.getInvitationsToOrganization(
                props.organizationId
            );
        }

        let newPaginatedData: IRecord[] = invitations.map((invitation) => ({
            invitation,
            organization: invitation.organization as IOrganization
        }));

        const newTotal = newPaginatedData.length;

        newPaginatedData = newPaginatedData.slice(offset, offset + requestedPageSize);

        return {
            paginatedData: newPaginatedData,
            total: newTotal
        };
    }

    const { paginatedData, loadPage, total, pageSize } = usePaginatedLoader<IRecord>({
        getPaginatedData
    });

    useEffect(() => {
        loadPage(1);
    }, [organizationClient]);

    async function accept(rowIndex: number) {
        const invitation = paginatedData[rowIndex]?.invitation;

        if (
            [OrganizationInvitationStatus.Accepted, OrganizationInvitationStatus.Rejected].includes(
                invitation.status
            )
        ) {
            showNotification(`Invitation has already been processed`, NotificationType.Error);

            return;
        }

        dispatch(setLoading(true));

        try {
            await organizationClient.acceptInvitation(invitation.id);

            showNotification(`Invitation accepted.`, NotificationType.Success);
            dispatch(refreshUserOffchain());
            await loadPage(1);
        } catch (error) {
            showNotification(`Could not accept invitation.`, NotificationType.Error);
            console.error(error);
        }

        dispatch(setLoading(false));
    }

    async function reject(rowIndex: number) {
        const invitation = paginatedData[rowIndex]?.invitation;

        if (
            [OrganizationInvitationStatus.Accepted, OrganizationInvitationStatus.Rejected].includes(
                invitation.status
            )
        ) {
            showNotification(`Invitation has already been processed`, NotificationType.Error);

            return;
        }

        dispatch(setLoading(true));

        try {
            await organizationClient.rejectInvitation(invitation.id);

            showNotification(`Invitation rejected.`, NotificationType.Success);

            await loadPage(1);
        } catch (error) {
            showNotification(`Could not reject invitation.`, NotificationType.Error);
            console.error(error);
        }

        dispatch(setLoading(false));
    }

    const actions =
        typeof props.organizationId === 'undefined'
            ? [
                  {
                      icon: <Check />,
                      name: 'Accept',
                      onClick: (row: string) => accept(parseInt(row, 10))
                  },
                  {
                      icon: <Clear />,
                      name: 'Reject',
                      onClick: (row: string) => reject(parseInt(row, 10))
                  }
              ]
            : [];

    const columns = [
        { id: 'organization', label: 'Organization' },
        { id: 'email', label: 'Email' },
        { id: 'status', label: 'Status' }
    ] as const;

    const rows = paginatedData.map(({ organization, invitation }) => {
        return {
            organization: organization.name,
            status: getOrganizationInvitationStatusText(invitation.status),
            email: invitation.email
        };
    });

    return (
        <TableMaterial
            columns={columns}
            rows={rows}
            loadPage={loadPage}
            total={total}
            pageSize={pageSize}
            actions={actions}
        />
    );
}
