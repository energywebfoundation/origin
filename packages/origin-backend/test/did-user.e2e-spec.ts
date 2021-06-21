/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import { DatabaseService } from '@energyweb/origin-backend-utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { expect } from 'chai';
import request from 'supertest';
import { IAM, setCacheClientOptions, setChainConfig, ENSNamespaceTypes } from 'iam-client-lib';

import { OrganizationService } from '../src/pods/organization/organization.service';
import { TUserBaseEntity, UserService, User } from '../src/pods/user';
import { bootstrapTestInstance } from './origin-backend';
import jwt from 'jsonwebtoken';
import { Role, UserStatus } from '@energyweb/origin-backend-core';
import { Repository } from 'typeorm';
import { after } from 'mocha';

describe('DID user e2e tests', function () {
    this.timeout(5000);

    let app: INestApplication;
    let databaseService: DatabaseService;
    let organizationService: OrganizationService;
    let userService: UserService;
    let userRepository: Repository<User>;

    before(async () => {
        ({
            app,
            databaseService,
            organizationService,
            userService,
            userRepository
            // invitationService
        } = await bootstrapTestInstance());

        await app.init();
    });

    after(async () => {
        await app?.close();
    });

    describe('Anonymous user, without having a valid accessToken', function () {
        it('when providing invalid identityToken signed by bogus key, should not be able to log in', async function () {
            const invalidToken = jwt.sign(
                {
                    iss: 'did:ethr:0x82FcB31385EaBe261E4e6003b9F2Cb2af34e2654',
                    claimData: {
                        blockNumber: 12158710
                    }
                },
                'bogus-private-key'
            );

            const res = await request(app.getHttpServer())
                .post('/auth/login-did')
                .send({ identityToken: invalidToken })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('when providing invalid identityToken signed by a valid server key, should not be able to log in', async function () {
            const invalidToken = jwt.sign(
                {
                    iss: 'did:ethr:0x82FcB31385EaBe261E4e6003b9F2Cb2af34e2654',
                    claimData: {
                        blockNumber: 12158710
                    }
                },
                process.env.JWT_SECRET
            );

            const res = await request(app.getHttpServer())
                .post('/auth/login-did')
                .send({ identityToken: invalidToken })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('should not be able to register as DID user without providing a token', async function () {
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

    describe('A user with a valid DID', function () {
        let iam: IAM;
        let identityToken: string, did: string, didDocument: {};

        before(async () => {
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
        });

        describe('when not registered on Origin', function () {
            it('should be able to login using auth/login-did endpoint with a valid DID identityToken', async function () {
                const accessToken = await loginDidUser(app, identityToken);

                expect(accessToken).to.exist;

                const tokenDecoded = jwt.verify(accessToken, process.env.JWT_SECRET) as unknown as {
                    did: string;
                    iat: string;
                    verifiedRoles: object[];
                };

                expect(tokenDecoded).to.contain.keys(['did', 'iat', 'verifiedRoles']);
                expect(tokenDecoded.did).equal(did);
            });

            describe('then, when logged in as DID user', function () {
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

                it('should be able to get DID roles', async function () {
                    const accessTokenDecoded = jwt.verify(accessToken, process.env.JWT_SECRET) as {
                        did: string;
                        verifiedRoles: { name: string; namespace: string }[];
                    };

                    const { body: responseBody } = await request(app.getHttpServer())
                        .get('/user/did-roles')
                        .set('Authorization', `Bearer ${accessToken}`)
                        .expect(HttpStatus.OK);

                    expect(responseBody).to.exist;
                    expect(responseBody.roles.sort()).to.deep.equal(
                        accessTokenDecoded.verifiedRoles.map((r) => r.namespace).sort()
                    );
                });

                describe('when not having organizationadmin role of any org. and role within already registered org.', function () {
                    let accessToken: string;

                    before(() => {
                        accessToken = generateAccessToken(did, [
                            'admin.roles.app1.apps.foobar-43sdf.iam.ewc',
                            'foobar.roles.app1.apps.foobar-34hdfh.iam.ewc'
                        ]);
                    });

                    it('should not be able to register a new DID user account', async function () {
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
                            .expect(HttpStatus.FORBIDDEN);
                    });
                });

                describe('when having organizationadmin role of a random, not registered organization', function () {
                    let accessToken: string;

                    before(() => {
                        databaseService.truncate('user');
                        accessToken = generateAccessToken(did, [
                            'organizationadmin.roles.foobar-43sdf.iam.ewc'
                        ]);
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

                    describe('then, corresponding user table record', function () {
                        let userRecord: TUserBaseEntity,
                            rawUserTableRecord: { [index: string]: string | number | null };

                        before(async () => {
                            userRecord = await userService.findByDid(did);
                            rawUserTableRecord = (
                                await userRepository.query(
                                    `Select * from public.user where did='${did}'`
                                )
                            )[0];
                        });

                        it('should be created', function () {
                            expect(userRecord).to.exist;
                        });

                        it('should have did field set to on-chain did', function () {
                            expect(userRecord.did).eq(did);
                        });

                        it('should have password field set to null', async function () {
                            expect(rawUserTableRecord).to.exist;
                            expect(rawUserTableRecord.password).to.be.null;
                        });

                        it('should have rights record set to OrganizationAdmin', function () {
                            expect(rawUserTableRecord.rights).to.equal(Role.OrganizationAdmin);
                        });
                    });
                });

                describe('when having organizationadmin role of a already registered organization', function () {
                    const organizationNamespace = 'org1.iam.ewc';
                    let accessToken: string;

                    before(() => {
                        databaseService.truncate('user');
                        accessToken = generateAccessToken(did, [
                            `organizationadmin.roles.${organizationNamespace}`
                        ]);
                        // TODO: create an organization after organizations registration is implemented
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

                    describe('then, corresponding user table record', function () {
                        let userRecord: TUserBaseEntity,
                            rawUserTableRecord: { [index: string]: string | number | null };

                        before(async () => {
                            userRecord = await userService.findByDid(did);
                            rawUserTableRecord = (
                                await userRepository.query(
                                    `Select * from public.user where did='${did}'`
                                )
                            )[0];
                        });

                        it('should be created', function () {
                            expect(userRecord).to.exist;
                        });

                        it('should have did field set to on-chain did', function () {
                            expect(userRecord.did).eq(did);
                        });

                        it('should have password field set to null', async function () {
                            expect(rawUserTableRecord).to.exist;
                            expect(rawUserTableRecord.password).to.be.null;
                        });

                        it('should have rights record set to OrganizationAdmin', function () {
                            expect(rawUserTableRecord.rights).to.equal(Role.OrganizationAdmin);
                        });
                    });
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

                it('should have rights record set according to on-chain roles', function () {
                    this.skip(); // TODO: implement test
                });

                it('should have rights field updated to reflect accessToken roles on every REST API request', function () {
                    this.skip(); // TODO: implement test
                });
            });

            describe('after set active', function () {
                before(async () => {
                    const user = await userService.findByDid(did);
                    user.status = UserStatus.Active;
                    await userService.update(user.id, user);
                });

                it('should be able to request an endpoint covered with JWT and active user guards', async function () {
                    const response = await request(app.getHttpServer())
                        .get(`/user/${userId}`)
                        .set('Authorization', `Bearer ${accessToken}`)
                        .expect(HttpStatus.OK);
                });

                it('should be able to request an endpoint covered with JWT, active user and roles guards', async function () {
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
 *
 * WARNING!!! This is probably not a reliable method of getting actual roles of a DID user
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
