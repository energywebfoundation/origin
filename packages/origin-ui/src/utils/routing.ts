export const getAssetsLink = (baseURL: string) => {
    return `${baseURL}/assets`;
}

export const getCertificatesLink = (baseURL: string) => {
    return `${baseURL}/certificates`;
}

export const getAdminLink = (baseURL: string) => {
    return `${baseURL}/admin`;
}

export const getDemandsLink = (baseURL: string) => {
    return `${baseURL}/demands`;
}

export const getProducingAssetDetailLink = (baseURL: string, assetId: string) => {
    return `${getAssetsLink(baseURL)}/producing_detail_view/${assetId}`
}