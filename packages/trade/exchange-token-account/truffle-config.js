require('ts-node/register');

module.exports = {
    test_file_extension_regexp: /.*\.ts$/,

    networks: {
        development: {
            host: 'localhost',
            port: 8570,
            network_id: '*',
            gas: 8000000,
            gasPrice: 0
        },
        coverage: {
            host: 'localhost',
            network_id: '*',
            port: 8555, // <-- If you change this, also set the port option in .solcover.js.
            gas: 80000000, // <-- Use this high gas value
            gasPrice: 0x01 // <-- Use this low gas price
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
