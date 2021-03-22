import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Check } from '@material-ui/icons';
import { Countries } from '@energyweb/utils-general';
import {
    IPublicOrganization,
    OrganizationStatus,
    Role,
    isRole
} from '@energyweb/origin-backend-core';
import { getUserOffchain } from '../../features/users';
import { setLoading, getBackendClient } from '../../features/general';
import { showNotification, NotificationType } from '../../utils/notifications';
import { useLinks } from '../../utils/routing';
import {
    TableMaterial,
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../Table';

interface IRecord {
    organization: IPublicOrganization;
}

function getOrganizationText(status: OrganizationStatus) {
    if (status === OrganizationStatus.Active) {
        return 'Active';
    }

    if (status === OrganizationStatus.Denied) {
        return 'Denied';
    }

    return 'Submitted';
}

export function OrganizationTable() {
    const organizationClient = useSelector(getBackendClient)?.organizationClient;
    const user = useSelector(getUserOffchain);

    const { getOrganizationViewLink } = useLinks();

    const history = useHistory();

    const dispatch = useDispatch();

    const hasApprovalRights = isRole(user, Role.Admin, Role.SupportAgent);

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

        const { data: entities } = await organizationClient.getAll();

        let newPaginatedData: IRecord[] = entities.map((i) => ({
            organization: i
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

    function viewEntity(rowIndex: number) {
        const organizationId = paginatedData[rowIndex]?.organization?.id;

        history.push(getOrganizationViewLink(organizationId.toString()));
    }

    async function approve(rowIndex: number) {
        const organization = paginatedData[rowIndex]?.organization;

        if (organization.status !== OrganizationStatus.Submitted) {
            showNotification(
                `You can only approve organization with status submitted.`,
                NotificationType.Error
            );

            return;
        }

        dispatch(setLoading(true));

        try {
            await organizationClient.update(organization.id, {
                status: OrganizationStatus.Active
            });

            showNotification(`Organization approved.`, NotificationType.Success);

            await loadPage(1);
        } catch (error) {
            showNotification(`Could not approve organization.`, NotificationType.Error);
            console.error(error);
        }

        dispatch(setLoading(false));
    }

    const actions = hasApprovalRights
        ? [
              {
                  icon: <Check />,
                  name: 'Approve',
                  onClick: (index: string) => approve(parseInt(index, 10))
              }
          ]
        : [];

    const columns = [
        { id: 'name', label: 'Name' },
        { id: 'country', label: 'Country' },
        { id: 'tradeRegistryCompanyNumber', label: 'Trade Registry Company Number' },
        { id: 'status', label: 'Status' }
    ] as const;

    const rows = paginatedData.map(({ organization }) => {
        return {
            name: organization.name,
            country: Countries.find((i) => i.code === organization.country)?.name,
            tradeRegistryCompanyNumber: organization.tradeRegistryCompanyNumber,
            status: getOrganizationText(organization.status)
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
            handleRowClick={(index: string) => viewEntity(parseInt(index, 10))}
        />
    );
}
