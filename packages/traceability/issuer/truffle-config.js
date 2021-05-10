module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8560,
            network_id: '*',
            gas: 5000000
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
