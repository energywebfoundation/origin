enum EmailTypes {
    CERTS_APPROVED = 'Certificate(s) approved',
    FOUND_MATCHING_SUPPLY = 'Certificate(s) matching your demand',
    DEVICE_STATUS_CHANGED = 'Device Status Change',
    ORGANIZATION_STATUS_CHANGED = 'Update on the registration process',
    ORGANIZATION_INVITATION = 'New organization invitation',
    ORGANIZATION_REMOVED_MEMBER = 'You have been removed from an organization',
    ORGANIZATION_MEMBER_CHANGED_ROLE = 'Update to your user role',
    USER_STATUS_CHANGED = 'User Information Change',
    CONFIRM_EMAIL = 'Confirm your email address'
}

export default EmailTypes;
