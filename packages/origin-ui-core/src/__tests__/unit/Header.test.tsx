import React from 'react';
import { mount } from 'enzyme';
import { setupStore, WrapperComponent } from '../utils/helpers';
import { Header, getAddressDisplay } from '../../components/Header';
import { User } from '@energyweb/user-registry';
import { addUser } from '../../features/users/actions';
import { addAccount, addEncryptedAccount } from '../../features/authentication/actions';
import { IStoreState } from '../../types';
import { Store } from 'redux';
import { MemoryHistory } from 'history';
import { IUserWithRelationsIds } from '@energyweb/origin-backend-core';

const ENCRYPTED_TRADER_KEYSTORE = {
    address: '0x7672fa3f8C04aBBcbaD14d896AaD8bedECe72d2b',
    encryptedPrivateKey: {
        version: 3,
        id: 'd1d724f0-885c-4e29-8793-42e74796c9f1',
        address: '7672fa3f8c04abbcbad14d896aad8bedece72d2b',
        crypto: {
            ciphertext: '279fc512834f30baeaad358c7ddd13639bfcfb533c924bba479ede42665cc3c1',
            cipherparams: { iv: 'a3ade44783ab731e3dfbbc33abfa271c' },
            cipher: 'aes-128-ctr',
            kdf: 'scrypt',
            kdfparams: {
                dklen: 32,
                salt: 'dd0adc71172df6d395385989a878f5bb8fe5758c4fb8805f90c3bb4a14426799',
                n: 8192,
                r: 8,
                p: 1
            },
            mac: 'c92788334ac87b13023e406e18bd78803ab879e1f4f2133362c0cce457b17970'
        }
    }
};

const USER_TRADER = ({
    active: true,
    id: '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b',
    initialized: true,
    offChainProperties: {},
    roles: 8,
    isRole: (role: number) => !!role,
    information: ({
        firstName: 'Trader_Forename',
        lastName: 'Trader_Surname'
    } as Partial<IUserWithRelationsIds>) as IUserWithRelationsIds
} as Partial<User.Entity>) as User.Entity;

const USER_DEVICE_MANAGER = ({
    active: true,
    id: '0x5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
    initialized: true,
    offChainProperties: {},
    roles: 12,
    information: ({
        firstName: 'DM_Forename',
        lastName: 'DM_Surname'
    } as Partial<IUserWithRelationsIds>) as IUserWithRelationsIds
} as Partial<User.Entity>) as User.Entity;

const EXPECTED_USER_TRADER_DISPLAY = getAddressDisplay(null, USER_TRADER);
const EXPECTED_USER_DEVICE_MANAGER_DISPLAY = getAddressDisplay(null, USER_DEVICE_MANAGER);

describe('Header', () => {
    let store: Store<IStoreState>;
    let history: MemoryHistory;
    let cleanupStore: () => void;

    beforeEach(() => {
        const userFetcher = {
            async fetch() {
                return null;
            }
        };

        const initializedStore = setupStore(undefined, {
            mockUserFetcher: true,
            logActions: false,
            userFetcher
        });

        store = initializedStore.store;
        history = initializedStore.history;
        cleanupStore = initializedStore.cleanupStore;
    });

    afterEach(() => {
        document.querySelectorAll(`#menu- ul`).forEach(item => item.remove());
        cleanupStore();
    });

    it('displays shows account as Guest when no accounts', async () => {
        function TestWrapper() {
            return <Header />;
        }

        const rendered = await mount(
            <WrapperComponent store={store} history={history}>
                <TestWrapper />
            </WrapperComponent>
        );

        expect(rendered.find('.MuiSelect-root').text()).toBe('Guest');
        expect(rendered.find('.MuiSelect-root').hasClass('Mui-disabled')).toBe(true);

        rendered.find(`.MuiSelect-root`).simulate('mousedown');

        expect(document.querySelectorAll(`#menu- ul li`).length).toEqual(0);
    });

    it('displays only one MetaMask account', async () => {
        const SETUP = {
            accounts: [{ address: '0x7672fa3f8C04aBBcbaD14d896AaD8bedECe72d2b' }],
            encryptedAccounts: [],
            users: [USER_TRADER]
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

        expect(rendered.find('.MuiSelect-root').text()).toBe(EXPECTED_USER_TRADER_DISPLAY);
        expect(rendered.find('.MuiSelect-root').hasClass('Mui-disabled')).toBe(true);

        rendered.find(`.MuiSelect-root`).simulate('mousedown');

        expect(document.querySelectorAll(`#menu- ul li`).length).toEqual(0);
    });

    it('correctly displays MetaMask accounts next to encrypted accounts', async () => {
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
                ENCRYPTED_TRADER_KEYSTORE
            ],
            users: [USER_DEVICE_MANAGER, USER_TRADER]
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

        expect(rendered.find('.MuiSelect-root').text()).toBe(EXPECTED_USER_TRADER_DISPLAY);
        expect(rendered.find('.MuiSelect-root').hasClass('Mui-disabled')).toBe(false);

        rendered.find(`.MuiSelect-root`).simulate('mousedown');

        expect(
            Array.from(document.querySelectorAll(`#menu- ul li`)).map(i => i.textContent)
        ).toStrictEqual([
            `${EXPECTED_USER_TRADER_DISPLAY} (MetaMask)`,
            EXPECTED_USER_DEVICE_MANAGER_DISPLAY,
            EXPECTED_USER_TRADER_DISPLAY
        ]);
    });

    it('correctly allows to pick encrypted account when no account (no MetaMask)', async () => {
        const SETUP = {
            encryptedAccounts: [ENCRYPTED_TRADER_KEYSTORE],
            users: [USER_TRADER]
        };

        SETUP.encryptedAccounts.map(encryptedAccount =>
            store.dispatch(addEncryptedAccount(encryptedAccount))
        );
        SETUP.users.map(user => store.dispatch(addUser(user as User.Entity)));

        function TestWrapper() {
            return <Header />;
        }

        const rendered = await mount(
            <WrapperComponent store={store} history={history}>
                <TestWrapper />
            </WrapperComponent>
        );

        expect(rendered.find('.MuiSelect-root').text()).toBe('Guest');
        expect(rendered.find('.MuiSelect-root').hasClass('Mui-disabled')).toBe(false);

        rendered.find(`.MuiSelect-root`).simulate('mousedown');

        expect(
            Array.from(document.querySelectorAll(`#menu- ul li`)).map(i => i.textContent)
        ).toStrictEqual([EXPECTED_USER_TRADER_DISPLAY, 'Guest (MetaMask)']);
    });

    it('correctly displays MetaMask guest account alongside encrypted account', async () => {
        const SETUP = {
            accounts: [{ address: '0x7110D0F07Be70Fc2A6C84fe66BF128593b2102Fb' }],
            encryptedAccounts: [ENCRYPTED_TRADER_KEYSTORE],
            users: [USER_TRADER]
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

        const EXPECTED_GUEST_DISPLAY = getAddressDisplay(SETUP.accounts[0].address, null);

        expect(rendered.find('.MuiSelect-root').text()).toBe(EXPECTED_GUEST_DISPLAY);
        expect(rendered.find('.MuiSelect-root').hasClass('Mui-disabled')).toBe(false);

        rendered.find(`.MuiSelect-root`).simulate('mousedown');

        expect(
            Array.from(document.querySelectorAll(`#menu- ul li`)).map(i => i.textContent)
        ).toStrictEqual([`${EXPECTED_GUEST_DISPLAY} (MetaMask)`, EXPECTED_USER_TRADER_DISPLAY]);
    });
});
