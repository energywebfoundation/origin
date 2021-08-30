import { useContext, useMemo } from 'react';
import { OriginFeature } from '@energyweb/utils-general';
import { OriginConfigurationContext } from '../PackageConfigurationProvider';

const baseURLPath = '';

const getDevicesLink = (baseURL: string) => `${baseURL}/devices`;
const getCertificatesLink = (baseURL: string) => `${baseURL}/certificates`;
const getAccountLink = (baseURL: string) => `${baseURL}/account`;
const getOrganizationLink = (baseURL: string) => `${baseURL}/organization`;
const getUserRegisterLink = (baseURL: string) => `${getAccountLink(baseURL)}/user-register`;
const getAccountLoginLink = (baseURL: string) => `${baseURL}/user-login`;
const getExchangeLink = (baseURL: string) => `${baseURL}/exchange`;
const getUserProfileLink = (baseURL: string) => `${getAccountLink(baseURL)}/user-profile`;
const getDevicesAddLink = (baseURL: string) => `${getDevicesLink(baseURL)}/add`;
const getDevicesOwnedLink = (baseURL: string) => `${getDevicesLink(baseURL)}/owned`;

const getCertificateDetailLink = (baseURL: string, certificateId: string | number) =>
    `${getCertificatesLink(baseURL)}/detail_view/${String(certificateId)}`;

const getCertificatesForDemandLink = (baseURL: string, demandId: number) =>
    `${getCertificatesLink(baseURL)}/for_demand/${demandId}`;

const getProducingDeviceDetailLink = (baseURL: string, deviceId: string | number) => {
    if (typeof deviceId === 'number') {
        deviceId = deviceId.toString();
    }
    return `${getDevicesLink(baseURL)}/producing_detail_view/${deviceId}`;
};

const getOrganizationViewLink = (baseURL: string, id: string) =>
    `${getOrganizationLink(baseURL)}/organization-view/${id}`;

const getOrganizationRegisterLink = (baseURL) =>
    `${getOrganizationLink(baseURL)}/organization-register`;

const getOrganizationIRecRegisterLink = (baseURL) =>
    `${getOrganizationLink(baseURL)}/register-irec`;

const getAdminLink = (baseURL: string) => `${baseURL}/admin`;

const getBundlesLink = (baseURL: string) => `${baseURL}/bundles`;

const getDeviceDetailsLink = (baseURL: string, deviceId: string | number): string => {
    return `${getDevicesLink(baseURL)}/producing_detail_view/${String(deviceId)}`;
};

export const linkPaths = {
    baseURL: baseURLPath,
    devicesPageUrl: getDevicesLink(baseURLPath),
    devicesAddPageUrl: getDevicesAddLink(baseURLPath),
    devicesOwnedPageUrl: getDevicesOwnedLink(baseURLPath),
    accountPageUrl: getAccountLink(baseURLPath),
    organizationPageUrl: getOrganizationLink(baseURLPath),
    certificatesPageUrl: getCertificatesLink(baseURLPath),
    exchangePageUrl: getExchangeLink(baseURLPath),
    getDeviceDetailsPageUrl: (deviceId: string | number) =>
        getDeviceDetailsLink(baseURLPath, deviceId),
    getCertificateDetailsPageUrl: (certificateId: string | number) =>
        getCertificateDetailLink(baseURLPath, certificateId),
    getCertificatesForDemandPageUrl: (demandId: number) =>
        getCertificatesForDemandLink(baseURLPath, demandId),
    getProducingDeviceDetailLink: (deviceId: string | number) =>
        getProducingDeviceDetailLink(baseURLPath, deviceId),
    getOrganizationDetailsPageUrl: (id: string) => getOrganizationViewLink(baseURLPath, id),
    organizationRegisterPageUrl: getOrganizationRegisterLink(baseURLPath),
    getOrganizationIRecRegisterUrl: getOrganizationIRecRegisterLink(baseURLPath),
    userRegisterPageUrl: getUserRegisterLink(baseURLPath),
    accountLoginPageUrl: getAccountLoginLink(baseURLPath),
    adminPageUrl: getAdminLink(baseURLPath),
    bundlesPageUrl: getBundlesLink(baseURLPath),
    userProfilePageUrl: getUserProfileLink(baseURLPath)
};

export const useLinks = () => {
    const originConfiguration = useContext(OriginConfigurationContext);

    return useMemo(() => {
        return {
            baseURL: baseURLPath,
            defaultPageUrl: originConfiguration?.enabledFeatures.includes(OriginFeature.Devices)
                ? getDevicesLink(baseURLPath)
                : originConfiguration?.enabledFeatures.includes(OriginFeature.Exchange)
                ? getExchangeLink(baseURLPath)
                : getAccountLink(baseURLPath),
            devicesPageUrl: getDevicesLink(baseURLPath),
            devicesAddPageUrl: getDevicesAddLink(baseURLPath),
            devicesOwnedPageUrl: getDevicesOwnedLink(baseURLPath),
            accountPageUrl: getAccountLink(baseURLPath),
            organizationPageUrl: getOrganizationLink(baseURLPath),
            certificatesPageUrl: getCertificatesLink(baseURLPath),
            exchangePageUrl: getExchangeLink(baseURLPath),
            getDeviceDetailsPageUrl: (deviceId: string | number) =>
                getDeviceDetailsLink(baseURLPath, deviceId),
            getCertificateDetailsPageUrl: (certificateId: string | number) =>
                getCertificateDetailLink(baseURLPath, certificateId),
            getCertificatesForDemandPageUrl: (demandId: number) =>
                getCertificatesForDemandLink(baseURLPath, demandId),
            getProducingDeviceDetailsPageUrl: (deviceId: string | number) =>
                getProducingDeviceDetailLink(baseURLPath, deviceId),
            getOrganizationDetailsPageUrl: (id: string) => getOrganizationViewLink(baseURLPath, id),
            organizationRegisterPageUrl: getOrganizationRegisterLink(baseURLPath),
            organizationIRecRegisterUrl: getOrganizationIRecRegisterLink(baseURLPath),
            userRegisterPageUrl: getUserRegisterLink(baseURLPath),
            accountLoginPageUrl: getAccountLoginLink(baseURLPath),
            adminPageUrl: getAdminLink(baseURLPath),
            bundlesPageUrl: getBundlesLink(baseURLPath),
            userProfilePageUrl: getUserProfileLink(baseURLPath)
        };
    }, [baseURLPath, originConfiguration?.enabledFeatures]);
};
