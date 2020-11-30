import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Check, Clear } from '@material-ui/icons';
import {
    IPublicOrganization,
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
import { getBackendClient } from '../../features/general/selectors';
import { refreshUserOffchain } from '../../features/users/actions';
import { useTranslation, useLinks } from '../..';

interface IRecord {
    organization: IPublicOrganization;
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
    const organizationClient = useSelector(getBackendClient)?.organizationClient;
    const invitationClient = useSelector(getBackendClient)?.invitationClient;

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const history = useHistory();
    const { getDefaultLink } = useLinks();

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

        const getInvitationsFrom = props.email
            ? invitationClient.getInvitations()
            : organizationClient.getInvitationsForOrganization(props.organizationId);

        const invitations: IOrganizationInvitation[] = (await getInvitationsFrom).data.map(
            (invitation) => ({
                ...invitation,
                role: invitation.role,
                createdAt: new Date(invitation.createdAt)
            })
        );

        let newPaginatedData: IRecord[] = invitations.map((invitation) => ({
            invitation,
            organization: invitation.organization as IPublicOrganization
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
            await invitationClient.updateInvitation(
                invitation.id.toString(),
                OrganizationInvitationStatus.Accepted
            );
            const { data: invitations } = await invitationClient.getInvitations();
            invitations
                .filter((inv) => inv.id !== invitation.id)
                .forEach((inv) =>
                    invitationClient.updateInvitation(
                        inv.id.toString(),
                        OrganizationInvitationStatus.Rejected
                    )
                );

            showNotification(`Invitation accepted.`, NotificationType.Success);
            dispatch(refreshUserOffchain());
            history.push(getDefaultLink());
        } catch (error) {
            showNotification(`Could not accept invitation.`, NotificationType.Error);
            console.error(error);
            console.log(error);
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
            await invitationClient.updateInvitation(
                invitation.id.toString(),
                OrganizationInvitationStatus.Rejected
            );

            showNotification(`Invitation rejected.`, NotificationType.Success);

            await loadPage(1);
        } catch (error) {
            showNotification(`Could not reject invitation.`, NotificationType.Error);
            console.error(error);
        }

        dispatch(setLoading(false));
    }

    const columns = [
        { id: 'email', label: 'Email' },
        { id: 'status', label: 'Status' }
    ];

    if (!props.organizationId) {
        columns.unshift({ id: 'organization', label: 'Organization' });
    }

    const rows = paginatedData.map(({ organization, invitation }) => {
        return {
            organization: organization?.name,
            status: getOrganizationInvitationStatusText(invitation.status),
            email: invitation.email
        };
    });

    const actions =
        typeof props.organizationId === 'undefined'
            ? rows.map((currentRow) =>
                  OrganizationInvitationStatus[currentRow.status] ===
                  OrganizationInvitationStatus.Pending
                      ? [
                            {
                                icon: <Check />,
                                name: t('organization.invitations.actions.accept'),
                                onClick: (row: string) => accept(parseInt(row, 10))
                            },
                            {
                                icon: <Clear />,
                                name: t('organization.invitations.actions.decline'),
                                onClick: (row: string) => reject(parseInt(row, 10))
                            }
                        ]
                      : []
              )
            : [];

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
