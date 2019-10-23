module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 8000000
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 80000000, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    }
  },
  compilers: {
    solc: {
        version: '0.5.12',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
}
};