import React, { useEffect } from 'react';
import { Role } from '@energyweb/user-registry';
import { showNotification, NotificationType } from '../../utils/notifications';
import { useSelector, useDispatch } from 'react-redux';
import { TableMaterial } from '../Table/TableMaterial';
import { Check } from '@material-ui/icons';
import { getCurrentUser } from '../../features/users/selectors';
import { setLoading } from '../../features/general/actions';
import {
    IPaginatedLoaderHooksFetchDataParameters,
    usePaginatedLoader
} from '../Table/PaginatedLoaderHooks';
import { getEnvironment } from '../../features/general/selectors';
import axios from 'axios';
import { Countries } from '@energyweb/utils-general';
import { IOrganization, OrganizationStatus } from '@energyweb/origin-backend-core';
import { useLinks } from '../../utils/routing';
import { useHistory } from 'react-router-dom';

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
    const currentUser = useSelector(getCurrentUser);
    const environment = useSelector(getEnvironment);

    const { getOrganizationViewLink } = useLinks();

    const history = useHistory();

    const dispatch = useDispatch();

    const isIssuer = currentUser?.isRole(Role.Issuer);

    async function getPaginatedData({
        requestedPageSize,
        offset
    }: IPaginatedLoaderHooksFetchDataParameters) {
        if (!environment) {
            return {
                paginatedData: [],
                total: 0
            };
        }

        const response = await axios.get(`${environment.BACKEND_URL}/api/Organization`);
        const entities: IOrganization[] = response.data;

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
    }, [currentUser, environment]);

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
            await axios.put(`${environment.BACKEND_URL}/api/Organization/${organization.id}`, {
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
