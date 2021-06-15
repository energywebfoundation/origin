/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';
import { IAM, setCacheClientOptions, setChainConfig, ENSNamespaceTypes } from 'iam-client-lib';

import { OrganizationService } from '../src/pods/organization/organization.service';
import { TUserBaseEntity, UserService } from '../src/pods/user';
import { bootstrapTestInstance } from './origin-backend';
import jwt from 'jsonwebtoken';
import { UserStatus } from '@energyweb/origin-backend-core';

describe('DID user e2e tests', function () {
    this.timeout(5000);

    let app: INestApplication;
    let databaseService: DatabaseService;
    let organizationService: OrganizationService;
    let userService: UserService;
    let iam: IAM;
    let identityToken: string, did: string, didDocument: {};

    before(async () => {
        ({
            app,
            databaseService,
            organizationService,
            userService
            // invitationService
        } = await bootstrapTestInstance());

        await app.init();

        setCacheClientOptions(73799, {
            url: 'https://volta-identitycache.energyweb.org/',
            cacheServerSupportsAuth: true
        });

        setChainConfig(73799, {
            rpcUrl: 'https://volta-rpc.energyweb.org'
        });

        expect(process.env.TEST_DID_USER_PRIVATE_KEY).to.exist;

        iam = new IAM({
            rpcUrl: 'https://volta-rpc.energyweb.org',
            privateKey: process.env.TEST_DID_USER_PRIVATE_KEY
        });

        // this is equivalent of generating an identity token by signing transaction with Metamask or other wallet
        ({ identityToken, did, didDocument } = await iam.initializeConnection());

        expect(identityToken).to.exist;
        expect(did).to.exist;
        expect(didDocument).to.exist;
    });

    after(async () => {
        await iam?.closeConnection();
        await app?.close();
    });

    describe('Anonymous user, without having a valid accessToken', function () {
        it('should not be able to register as DID user', async function () {
            await request(app.getHttpServer())
                .post('/user/register-did')
                .send({
                    titleSelect: 'Mr',
                    titleInput: '',
                    firstName: 'a',
                    lastName: '1',
                    did: 'sdfsdf',
                    telephone: '123',
                    email: 'aa@a.aa',
                    title: 'Mr'
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });
    });

    describe('Existing DID', function () {
        describe('when not registered on Origin', function () {
            it('should be able to login using auth/login-did endpoint', async function () {
                const accessToken = await loginDidUser(app, identityToken);

                expect(accessToken).to.exist;
            });

            describe('when logged in as DID user', function () {
                let accessToken: string;

                before(async function () {
                    accessToken = generateAccessToken(did, [
                        'role1.roles.app-test2.apps.artur.iam.ewc',
                        'organizationadmin.roles.artur.iam.ewc'
                    ]);
                });

                after(async function () {
                    databaseService.truncate('user');
                });

                it('should not be able to request endpoint covered with only JWT guard', async function () {
                    await request(app.getHttpServer())
                        .get('/user/me')
                        .set('Authorization', `Bearer ${accessToken}`)
                        .expect(HttpStatus.UNAUTHORIZED);
                });

                it('should be able to register an account on Origin using user/register-did endpoint', async function () {
                    await request(app.getHttpServer())
                        .post('/user/register-did')
                        .set('Authorization', `Bearer ${accessToken}`)
                        .send({
                            titleSelect: 'Mr',
                            titleInput: '',
                            firstName: 'DID',
                            lastName: did,
                            did,
                            telephone: '123',
                            email: 'aa@a.aa',
                            title: 'Mr'
                        })
                        .expect(HttpStatus.CREATED);
                });

                it('access token should contain verifiedRoles field containing on-chain roles', async function () {
                    const accessToken = await loginDidUser(app, identityToken).catch((err) => {
                        throw new Error('precondition failed');
                    });

                    const accessTokenDecoded = jwt.verify(accessToken, process.env.JWT_SECRET) as {
                        did: string;
                        verifiedRoles: { name: string; namespace: string }[];
                    };

                    expect(accessTokenDecoded).to.contain.keys(['did', 'verifiedRoles']);
                    expect(accessTokenDecoded.verifiedRoles).to.be.an('array');

                    const onChainRoles = (await getDidRoles(iam, did)).sort(),
                        accessTokenRoles = accessTokenDecoded.verifiedRoles
                            .map((r) => r.namespace)
                            .sort();

                    accessTokenRoles.forEach((accTokenRole) =>
                        expect(onChainRoles).to.include(accTokenRole)
                    );

                    // TODO: implement check if all expected on-chain roles are included in the access token
                });
            });
        });

        describe('when registered on Origin and not activated yet', function () {
            let accessToken: string, userId: string;

            before(async function () {
                databaseService.truncate('user');

                accessToken = generateAccessToken(did, [
                    'role1.roles.app-test2.apps.artur.iam.ewc',
                    'organizationadmin.roles.artur.iam.ewc'
                ]);

                const res = await request(app.getHttpServer())
                    .post('/user/register-did')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send({
                        titleSelect: 'Mr',
                        titleInput: '',
                        firstName: 'DID',
                        lastName: did,
                        did,
                        telephone: '123',
                        email: 'aa@a.aa',
                        title: 'Mr'
                    })
                    .expect(HttpStatus.CREATED);

                userId = res.body.id;
            });

            it('should be able to log in', async function () {
                expect(accessToken).to.exist;
            });

            it('should be able to request endpoint covered with only JWT guard', async function () {
                const response = await request(app.getHttpServer())
                    .get('/user/me')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(HttpStatus.OK);
            });

            describe('corresponding user table record', function () {
                let userRecord: TUserBaseEntity;

                before(async () => {
                    userRecord = await userService.findByDid(did);
                });

                it('should be created', function () {
                    expect(userRecord).to.exist;
                });

                it('should have did field set to on-chain did', function () {
                    expect(userRecord.did).eq(did);
                });

                it('should have password field set to null', function () {
                    this.skip(); // TODO: implement test
                });

                it('should have rights record set according to on-chain roles', function () {
                    this.skip(); // TODO: implement test
                });

                it('should have rights field updated to reflect on-chain roles on every REST API request', function () {
                    this.skip(); // TODO: implement test
                });
            });

            describe('after set active', function () {
                before(async () => {
                    const user = await userService.findByDid(did);
                    user.status = UserStatus.Active;
                    await userService.update(user.id, user);
                });

                it('should be able to request endpoint covered with JWT and active user guards', async function () {
                    const response = await request(app.getHttpServer())
                        .get(`/user/${userId}`)
                        .set('Authorization', `Bearer ${accessToken}`)
                        .expect(HttpStatus.OK);
                });

                it('should be able to request endpoint covered with JWT, active user and roles guards', async function () {
                    const response = await request(app.getHttpServer())
                        .post(`/invitation`)
                        .set('Authorization', `Bearer ${accessToken}`)
                        .send({
                            email: 'invited@a.aa',
                            role: 4
                        })
                        .expect(HttpStatus.BAD_REQUEST, {
                            success: false,
                            message: "User doesn't belong to any organization."
                        });
                });
            });
        });
    });
});

/**
 * Generates an access token with exactly the same payload as an access token returned by
 * the passport-did-auth strategy when requested with a valid DID identity token
 */
function generateAccessToken(did: string, roles: string[]) {
    const payload = {
        did,
        verifiedRoles: roles.map((role) => {
            const name = role.split('.')[0];
            return {
                name,
                namespace: role
            };
        })
    };

    return jwt.sign(payload, process.env.JWT_SECRET);
}

async function loginDidUser(app: any, identityToken: string): Promise<string> {
    const res = await request(app.getHttpServer())
        .post('/auth/login-did')
        .send({ identityToken })
        .expect(HttpStatus.OK);

    expect(res.body).to.contain.keys(['accessToken']);

    return res.body.accessToken;
}

/**
 * Returns an array of roles for a given DID,
 * extracted from claims (IAM.getUserClaims)
 */
async function getDidRoles(iam: IAM, did: string): Promise<string[]> {
    const userClaims = await iam.getUserClaims({ did });

    return userClaims
        .filter((claim) => !!claim.claimType) // getting only claims with claimType property
        .map((claim) => claim.claimType)
        .filter((claimType) => {
            const arr = claimType.split('.');
            return arr.length > 1 && arr[1] === ENSNamespaceTypes.Roles;
        });
}
