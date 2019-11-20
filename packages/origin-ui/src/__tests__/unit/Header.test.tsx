import React from 'react';
import { mount } from 'enzyme';
import { setupStore, WrapperComponent } from '../utils/helpers';
import { Header } from '../../components/Header';
import { User } from '@energyweb/user-registry';
import { addUser } from '../../features/users/actions';
import { addAccount, addEncryptedAccount } from '../../features/authentication/actions';

describe('Header', () => {
    it('displays only one MetaMask account', async () => {
        const { store, history, cleanupStore } = setupStore(undefined, {
            mockUserFetcher: true,
            logActions: false
        });

        const SETUP = {
            accounts: [{ address: '0x7672fa3f8C04aBBcbaD14d896AaD8bedECe72d2b' }],
            encryptedAccounts: [],
            isUsingPK: false,
            users: [
                {
                    active: true,
                    id: '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b',
                    initialized: true,
                    offChainProperties: {
                        firstName: 'John',
                        surname: 'Doe Six',
                        email: 'trader@mailinator.com'
                    },
                    organization: 'Trader Organization',

                    roles: 8
                } as Partial<User.Entity>
            ]
        };

        SETUP.encryptedAccounts.map(encryptedAccount =>
            store.dispatch(addEncryptedAccount(encryptedAccount))
        );
        SETUP.users.map(user => store.dispatch(addUser(user as User.Entity)));
        store.dispatch(addAccount(SETUP.accounts[0]));

        function TestWrapper() {
            return <Header />;
        }

        const rendered = await mount(
            <WrapperComponent store={store} history={history}>
                <TestWrapper />
            </WrapperComponent>
        );

        expect(rendered.find('.MuiSelect-root').text()).toBe('Trader Organization');

        rendered.find(`.MuiSelect-root`).simulate('click');

        expect(
            Array.from(document.querySelectorAll(`#menu- ul li`)).map(i => i.textContent)
        ).toStrictEqual(['Trader Organization (MetaMask)']);

        cleanupStore();
    });

    it('displays correctly displays MetaMask accounts next to encrypted accounts', async () => {
        const { store, history, cleanupStore } = setupStore(undefined, {
            mockUserFetcher: false,
            logActions: false
        });

        const SETUP = {
            accounts: [{ address: '0x7672fa3f8C04aBBcbaD14d896AaD8bedECe72d2b' }],
            encryptedAccounts: [
                {
                    address: '0x5B1B89A48C1fB9b6ef7Fb77C453F2aAF4b156d45',
                    encryptedPrivateKey: {
                        version: 3,
                        id: 'da750a17-3aa0-45bc-8c99-545ec27be0c0',
                        address: '5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
                        crypto: {
                            ciphertext:
                                'b054f1bdd5b45519b356830d770b1870e941a6e0c8a9285d74d51d04e6b973b4',
                            cipherparams: { iv: '9cd5e4b0a067783a339474ca02cda136' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt:
                                    '529754ac4d7364f597cc900b5d8bc540880afac4d55fd1fde03255059e87d109',
                                n: 8192,
                                r: 8,
                                p: 1
                            },
                            mac: 'dbd33899b2ade5ed36889d7e96b9a3424c0c24fc62a7089ab8e06e09d19e80cf'
                        }
                    }
                },
                {
                    address: '0x7672fa3f8C04aBBcbaD14d896AaD8bedECe72d2b',
                    encryptedPrivateKey: {
                        version: 3,
                        id: 'd1d724f0-885c-4e29-8793-42e74796c9f1',
                        address: '7672fa3f8c04abbcbad14d896aad8bedece72d2b',
                        crypto: {
                            ciphertext:
                                '279fc512834f30baeaad358c7ddd13639bfcfb533c924bba479ede42665cc3c1',
                            cipherparams: { iv: 'a3ade44783ab731e3dfbbc33abfa271c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt:
                                    'dd0adc71172df6d395385989a878f5bb8fe5758c4fb8805f90c3bb4a14426799',
                                n: 8192,
                                r: 8,
                                p: 1
                            },
                            mac: 'c92788334ac87b13023e406e18bd78803ab879e1f4f2133362c0cce457b17970'
                        }
                    }
                }
            ],
            isUsingPK: false,
            users: [
                {
                    active: true,
                    id: '0x5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
                    initialized: true,
                    offChainProperties: {
                        firstName: 'John',
                        surname: 'Doe Four',
                        email: 'assetmanager@mailinator.com'
                    },
                    organization: 'AssetManager Organization',
                    roles: 12
                },
                {
                    active: true,
                    id: '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b',
                    initialized: true,
                    offChainProperties: {
                        firstName: 'John',
                        surname: 'Doe Six',
                        email: 'trader@mailinator.com'
                    },
                    organization: 'Trader Organization',

                    roles: 8
                } as Partial<User.Entity>
            ]
        };

        SETUP.encryptedAccounts.map(encryptedAccount =>
            store.dispatch(addEncryptedAccount(encryptedAccount))
        );
        SETUP.users.map(user => store.dispatch(addUser(user as User.Entity)));
        store.dispatch(addAccount(SETUP.accounts[0]));

        function TestWrapper() {
            return <Header />;
        }

        const rendered = await mount(
            <WrapperComponent store={store} history={history}>
                <TestWrapper />
            </WrapperComponent>
        );

        expect(rendered.find('.MuiSelect-root').text()).toBe('Trader Organization');

        rendered.find(`.MuiSelect-root`).simulate('click');

        expect(
            Array.from(document.querySelectorAll(`#menu- ul li`)).map(i => i.textContent)
        ).toStrictEqual([
            'Trader Organization (MetaMask)',
            'AssetManager Organization',
            'Trader Organization'
        ]);

        cleanupStore();
    });
});
