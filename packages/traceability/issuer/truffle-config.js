const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
        development: {
            host: '127.0.0.1',
            port: 8560,
            network_id: '*',
            gas: 5000000
        },
        volta: {
            provider: function () {
                return new HDWalletProvider(
                    'chalk park staff buzz chair purchase wise oak receive avoid avoid home',
                    'https://volta.rpc.anyblock.tools/'
                );
            },
            network_id: 73799
        }
    },
    compilers: {
        solc: {
            version: './node_modules/solc',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
};
