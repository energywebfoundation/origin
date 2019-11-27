export enum MatchingErrorReason {
    NON_ACTIVE_DEMAND,
    NOT_ENOUGH_ENERGY,
    TOO_EXPENSIVE,
    NON_MATCHING_CURRENCY,
    NON_MATCHING_ASSET_TYPE,
    WRONG_ASSET_ID,
    OUT_OF_RANGE,
    NON_MATCHING_LOCATION,
    PERIOD_ALREADY_FILLED,
    VINTAGE_OUT_OF_RANGE
}

export function reasonsToString(reasons: MatchingErrorReason[]) {
    return reasons.map(reason => MatchingErrorReason[reason]).join(', ');
}
