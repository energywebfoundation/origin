import { useSelector } from 'react-redux';
import { getBaseURL } from '../features/selectors';

export function getAssetsLink(baseURL: string) {
    return `${baseURL}/assets`;
}

export function getCertificatesLink(baseURL: string) {
    return `${baseURL}/certificates`;
}

export function getDemandsLink(baseURL: string) {
    return `${baseURL}/demands`;
}

export function getAccountLink(baseURL: string) {
    return `${baseURL}/account`;
}

export function getDemandEditLink(baseURL: string, id: string) {
    return `${getDemandsLink(baseURL)}/edit/${id}`;
}

export function getDemandCloneLink(baseURL: string, id: string) {
    return `${getDemandsLink(baseURL)}/clone/${id}`;
}

export function getDemandViewLink(baseURL: string, id: string) {
    return `${getDemandsLink(baseURL)}/view/${id}`;
}

export function getCertificateDetailLink(baseURL: string, certificateId: string | number) {
    if (typeof certificateId === 'number') {
        certificateId = certificateId.toString();
    }

    return `${getCertificatesLink(baseURL)}/detail_view/${certificateId}`;
}

export function getCertificatesForDemandLink(baseURL: string, demandId: string | number) {
    if (typeof demandId === 'number') {
        demandId = demandId.toString();
    }

    return `${getCertificatesLink(baseURL)}/for_demand/${demandId}`;
}

export function getProducingAssetDetailLink(baseURL: string, assetId: string | number) {
    if (typeof assetId === 'number') {
        assetId = assetId.toString();
    }

    return `${getAssetsLink(baseURL)}/producing_detail_view/${assetId}`;
}

export function getConsumingAssetDetailLink(baseURL: string, assetId: string | number) {
    if (typeof assetId === 'number') {
        assetId = assetId.toString();
    }

    return `${getAssetsLink(baseURL)}/consuming_detail_view/${assetId}`;
}

export function useLinks() {
    const baseURL = useSelector(getBaseURL);

    return {
        baseURL,
        getAssetsLink: () => getAssetsLink(baseURL),
        getAccountLink: () => getAccountLink(baseURL),
        getConsumingAssetDetailLink: (assetId: string | number) =>
            getConsumingAssetDetailLink(baseURL, assetId),
        getCertificatesLink: () => getCertificatesLink(baseURL),
        getDemandsLink: () => getDemandsLink(baseURL),
        getDemandEditLink: (id: string) => getDemandEditLink(baseURL, id),
        getDemandCloneLink: (id: string) => getDemandCloneLink(baseURL, id),
        getDemandViewLink: (id: string) => getDemandViewLink(baseURL, id),
        getCertificateDetailLink: (certificateId: string | number) =>
            getCertificateDetailLink(baseURL, certificateId),
        getCertificatesForDemandLink: (demandId: string | number) =>
            getCertificatesForDemandLink(baseURL, demandId),
        getProducingAssetDetailLink: (assetId: string | number) =>
            getProducingAssetDetailLink(baseURL, assetId)
    };
}
