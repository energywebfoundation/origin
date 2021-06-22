# Switchboard integration - TODOs

## User registration

-   [ ] design and implementation: backend (and probably frontend or better UX) groups validations in various states and
        combinations (any ambiguity, redundancy etc.), examples:
    -   DID user has an `OrganizationAdmin` in multiple orgs/apps.
    -   DID user has an `OrganizationAdmin` in one org/app. and other role in another org/app.
    -   DID user has conflicting roles in the same application.
-   [ ] implementation of groups validation logic and setting user.rights accordingly in user/register-did. Based on ^^^
    -   it will
        require [chainToOriginRoleNamesMap](https://github.com/energywebfoundation/origin/blob/06c9a32842786441da924b3cd7392b4002fd10c7/packages/origin-backend/src/auth/jwt.strategy.ts#L10)
        to be exposed and available in the user.controller to map on-chain names to the Role entity keys
    -   to keep user.rights in sync with DID roles, it needs to be done on every request if not too "expensive"
-   [ ] design and implementation: in case of user not having an `OrganizationAdmin`, setting `user.rights` field value
        accordingly, after roles validation
    -   on DID user registration, an organisation needs to exist on Origin to accept a user role
    -   if no DID user role matches any already registered organisation, DID user registration request is denied.
-   [ ] implementation: user.rights value synchronization to DID roles
        in [jwt.strategy](https://github.com/energywebfoundation/origin/blob/06c9a32842786441da924b3cd7392b4002fd10c7/packages/origin-backend/src/auth/jwt.strategy.ts#L52) (
        made on every request, it is not expensive as DID roles are gathered from an access token). This requires user to be
        added to a DID organisation registered on Origin to pick up a right role from an access token verifiedRoles field.
-   [ ] implementation: `passport-did-auth` integration after it is fixed - should be easy, it is covered with tests now
-   [ ] design and implementation: frontend DID user registration form using `/user/register-did` endpoint to submit data.
    -   Should perform basic validations of on-chain data, however getting roles with `iam-client-lib` appears to be
        unreliable and should not be
        used ([see Swagger discussion](https://energywebfoundation.slack.com/archives/C01JHHRPFD0/p1623692435011600?thread_ts=1623667221.006000&cid=C01JHHRPFD0))
        , solution: implementing `/user/did-roles` endpoint to extract roles from an access token.
    -   Should give an option to choose an organization by a user to be added to or choose a role from if there is an
        ambiguity. Probably additional endpoint is going to be necessary for checking if any of organizations DID user is
        member of on-chain are already available on Origin.
-   [x] `/user/did-roles` endpoint for getting roles from an access token
-   [ ] decision, design - what if a user with a given email address is already registered and then DID user tries to
        register with the same email address?

## Organization registration

-   [ ] should user be required to register as an org. admin to register an organisation or just checking he has this DID
        role is enough?
-   [ ] design and implementation: extending data model to save DID only related data
-   [ ] split organization data to:
    -   provided by a user in an org. registration form
    -   fetched from the chain
-   [ ] design and implementation: frontend DID organization registration flow and form using `/organization/did` endpoint
        to submit data
