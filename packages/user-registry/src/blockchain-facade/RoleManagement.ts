export enum Role {
    UserAdmin,
    AssetAdmin,
    AssetManager,
    Trader,
    Matcher,
    Issuer
}

export function buildRights(roles: Role[]): number {
    if (!roles) {
        return 0;
    }

    return roles.reduce((a, b) => {
        return a | Math.pow(2, b);
    }, 0);
}
