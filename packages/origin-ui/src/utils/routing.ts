export const getAssetsLink = (baseURL: string) => {
    return `${baseURL}/assets`;
};

export const getCertificatesLink = (baseURL: string) => {
    return `${baseURL}/certificates`;
};

export const getDemandsLink = (baseURL: string) => {
    return `${baseURL}/demands`;
};

export const getDemandEditLink = (baseURL: string, id: string) => {
    return `${getDemandsLink(baseURL)}/edit/${id}`;
};

export const getDemandCloneLink = (baseURL: string, id: string) => {
    return `${getDemandsLink(baseURL)}/clone/${id}`;
};

export const getDemandViewLink = (baseURL: string, id: string) => {
    return `${getDemandsLink(baseURL)}/view/${id}`;
};

export const getCertificateDetailLink = (baseURL: string, certificateId: string | number) => {
    if (typeof certificateId === 'number') {
        certificateId = certificateId.toString();
    }

    return `${getCertificatesLink(baseURL)}/detail_view/${certificateId}`;
};

export const getCertificatesForDemandLink = (baseURL: string, demandId: string | number) => {
    if (typeof demandId === 'number') {
        demandId = demandId.toString();
    }

    return `${getCertificatesLink(baseURL)}/for_demand/${demandId}`;
};

export const getProducingAssetDetailLink = (baseURL: string, assetId: string | number) => {
    if (typeof assetId === 'number') {
        assetId = assetId.toString();
    }

    return `${getAssetsLink(baseURL)}/producing_detail_view/${assetId}`;
};

export const getConsumingAssetDetailLink = (baseURL: string, assetId: string | number) => {
    if (typeof assetId === 'number') {
        assetId = assetId.toString();
    }

    return `${getAssetsLink(baseURL)}/consuming_detail_view/${assetId}`;
};
