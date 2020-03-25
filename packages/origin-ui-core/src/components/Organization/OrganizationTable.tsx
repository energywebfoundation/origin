import React, { useEffect } from 'react';
import { showNotification, NotificationType } from '../../utils/notifications';
import { useSelector, useDispatch } from 'react-redux';
import { TableMaterial } from '../Table/TableMaterial';
import { Check } from '@material-ui/icons';
import { setLoading } from '../../features/general/actions';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../Table/PaginatedLoaderHooks';
import { getOffChainDataSource } from '../../features/general/selectors';
import { Countries } from '@energyweb/utils-general';
import { IOrganization, OrganizationStatus, Role, isRole } from '@energyweb/origin-backend-core';
import { useLinks } from '../../utils';
import { useHistory } from 'react-router-dom';
import { getUserOffchain } from '../../features/users/selectors';

interface IRecord {
    organization: IOrganization;
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
    const organizationClient = useSelector(getOffChainDataSource)?.organizationClient;
    const user = useSelector(getUserOffchain);

    const { getOrganizationViewLink } = useLinks();

    const history = useHistory();

    const dispatch = useDispatch();

    const isIssuer = isRole(user, Role.Issuer);

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

        const entities = await organizationClient.getAll();

        let newPaginatedData: IRecord[] = entities.map(i => ({
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

    const actions = isIssuer
        ? [
              {
                  icon: <Check />,
                  name: 'Approve',
                  onClick: (row: number) => approve(row)
              }
          ]
        : [];

    const columns = [
        { id: 'name', label: 'Name' },
        { id: 'headquartersCountry', label: 'Headquarters country' },
        { id: 'yearOfRegistration', label: 'Year of registration' },
        { id: 'status', label: 'Status' }
    ] as const;

    const rows = paginatedData.map(({ organization }) => {
        return {
            name: organization.name,
            headquartersCountry: Countries.find(i => i.id === organization.headquartersCountry)
                ?.name,
            yearOfRegistration: organization.yearOfRegistration,
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
            handleRowClick={viewEntity}
        />
    );
}
