import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Clear } from '@material-ui/icons';
import {
    IPublicOrganization,
    OrganizationInvitationStatus,
    IOrganizationInvitation
} from '@energyweb/origin-backend-core';
import { showNotification, NotificationTypeEnum } from '../../../utils/notifications';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../../Table';
import { fromGeneralActions, fromGeneralSelectors, fromUsersActions } from '../../../features';
import { useLinks } from '../../../hooks';

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

export const OrganizationInvitationTable = (props: IProps) => {
    const { organizationClient, invitationClient } =
        useSelector(fromGeneralSelectors.getBackendClient) ?? {};

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const history = useHistory();
    const { defaultPageUrl } = useLinks();

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
                invitation?.status
            )
        ) {
            showNotification(
                t('organization.invitations.notification.alreadyProcessed'),
                NotificationTypeEnum.Error
            );

            return;
        }

        dispatch(fromGeneralActions.setLoading(true));

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

            showNotification(
                t('organization.invitations.notification.acceptedSuccess'),
                NotificationTypeEnum.Success
            );
            dispatch(fromUsersActions.refreshUserOffchain());
            history.push(defaultPageUrl);
        } catch (error) {
            showNotification(
                t('organization.invitations.notification.acceptedFailure'),
                NotificationTypeEnum.Error
            );
            console.error(error);
            console.log(error);
        }

        dispatch(fromGeneralActions.setLoading(false));
    }

    async function reject(rowIndex: number) {
        const invitation = paginatedData[rowIndex]?.invitation;

        if (
            [OrganizationInvitationStatus.Accepted, OrganizationInvitationStatus.Rejected].includes(
                invitation?.status
            )
        ) {
            showNotification(
                t('organization.invitations.notification.alreadyProcessed'),
                NotificationTypeEnum.Error
            );

            return;
        }

        dispatch(fromGeneralActions.setLoading(true));

        try {
            await invitationClient.updateInvitation(
                invitation.id.toString(),
                OrganizationInvitationStatus.Rejected
            );

            showNotification(
                t('organization.invitations.notification.rejectedSuccess'),
                NotificationTypeEnum.Success
            );

            await loadPage(1);
        } catch (error) {
            showNotification(
                t('organization.invitations.notification.rejectedFailure'),
                NotificationTypeEnum.Error
            );
            console.error(error);
        }

        dispatch(fromGeneralActions.setLoading(false));
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
                                icon: <Check data-cy="accept-invitation-icon" />,
                                name: t('organization.invitations.actions.accept'),
                                onClick: (row: string) => accept(parseInt(row, 10))
                            },
                            {
                                icon: <Clear data-cy="decline-invitation-icon" />,
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
};
