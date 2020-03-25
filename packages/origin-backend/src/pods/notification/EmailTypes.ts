enum EmailTypes {
    CERTS_APPROVED = 'Certificate(s) approved',
    FOUND_MATCHING_SUPPLY = 'Certificate(s) matching your demand',
    DEMAND_PARTIALLY_FILLED = 'Your demands have been matched with certificates',
    DEMAND_FULFILLED = 'Demand(s) Fulfilled',
    DEVICE_STATUS_CHANGED = 'Device Status Change',
    ORGANIZATION_STATUS_CHANGED = 'Update on the registration process',
    ORGANIZATION_INVITATION = 'New organization invitation',
    ORGANIZATION_REMOVED_MEMBER = 'You have been removed from an organization'
}

export default EmailTypes;
