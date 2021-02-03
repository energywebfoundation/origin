import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { OriginFeature } from '@energyweb/utils-general';
import { getBaseURL } from '@energyweb/origin-ui-core';
import { OriginConfigurationContext } from './components/OriginConfigurationContext';

export function getDevicesLink(baseURL: string) {
    return `${baseURL}/devices`;
}

export function getCertificatesLink(baseURL: string) {
    return `${baseURL}/certificates`;
}

export function getAccountLink(baseURL: string) {
    return `${baseURL}/account`;
}

export function getOrganizationLink(baseURL: string) {
    return `${baseURL}/organization`;
}

export function getUserRegisterLink(baseURL: string) {
    return `${getAccountLink(baseURL)}/user-register`;
}

export function getAccountLoginLink(baseURL: string) {
    return `${baseURL}/user-login`;
}

export function getExchangeLink(baseURL: string) {
    return `${baseURL}/exchange`;
}

export function getUserProfileLink(baseURL: string) {
    return `${getAccountLink(baseURL)}/user-profile`;
}

export function getDevicesAddLink(baseURL: string) {
    return `${getDevicesLink(baseURL)}/add`;
}

export function getDevicesOwnedLink(baseURL: string) {
    return `${getDevicesLink(baseURL)}/owned`;
}

export function getCertificateDetailLink(baseURL: string, certificateId: string | number) {
    if (typeof certificateId === 'number') {
        certificateId = certificateId.toString();
    }

    return `${getCertificatesLink(baseURL)}/detail_view/${certificateId}`;
}

export function getCertificatesForDemandLink(baseURL: string, demandId: number) {
    return `${getCertificatesLink(baseURL)}/for_demand/${demandId}`;
}

export function getProducingDeviceDetailLink(baseURL: string, deviceId: string | number) {
    if (typeof deviceId === 'number') {
        deviceId = deviceId.toString();
    }

    return `${getDevicesLink(baseURL)}/producing_detail_view/${deviceId}`;
}

export function getOrganizationViewLink(baseURL: string, id: string) {
    return `${getOrganizationLink(baseURL)}/organization-view/${id}`;
}

export function getOrganizationRegisterLink(baseURL) {
    return `${getOrganizationLink(baseURL)}/organization-register`;
}

export function getOrganizationIRecRegisterLink(baseURL) {
    return `${getOrganizationLink(baseURL)}/register-irec`;
}

export function getAdminLink(baseURL: string) {
    return `${baseURL}/admin`;
}

export function getBundlesLink(baseURL: string) {
    return `${baseURL}/bundles`;
}

export function useLinks() {
    const baseURL = useSelector(getBaseURL);

    const { enabledFeatures } = useContext(OriginConfigurationContext);

    const defaultLink = enabledFeatures.includes(OriginFeature.Devices)
        ? getDevicesLink
        : enabledFeatures.includes(OriginFeature.Exchange)
        ? getExchangeLink
        : getAccountLink;

    return {
        baseURL,
        getDefaultLink: () => defaultLink(baseURL),
        getDevicesLink: () => getDevicesLink(baseURL),
        getDevicesAddLink: () => getDevicesAddLink(baseURL),
        getDevicesOwnedLink: () => getDevicesOwnedLink(baseURL),
        getAccountLink: () => getAccountLink(baseURL),
        getOrganizationLink: () => getOrganizationLink(baseURL),
        getCertificatesLink: () => getCertificatesLink(baseURL),
        getExchangeLink: () => getExchangeLink(baseURL),
        getCertificateDetailLink: (certificateId: string | number) =>
            getCertificateDetailLink(baseURL, certificateId),
        getCertificatesForDemandLink: (demandId: number) =>
            getCertificatesForDemandLink(baseURL, demandId),
        getProducingDeviceDetailLink: (deviceId: string | number) =>
            getProducingDeviceDetailLink(baseURL, deviceId),
        getOrganizationViewLink: (id: string) => getOrganizationViewLink(baseURL, id),
        getOrganizationRegisterLink: () => getOrganizationRegisterLink(baseURL),
        getOrganizationIRecRegisterLink: () => getOrganizationIRecRegisterLink(baseURL),
        getUserRegisterLink: () => getUserRegisterLink(baseURL),
        getAccountLoginLink: () => getAccountLoginLink(baseURL),
        getAdminLink: () => getAdminLink(baseURL),
        getBundlesLink: () => getBundlesLink(baseURL),
        getUserProfileLink: () => getUserProfileLink(baseURL)
    };
}
