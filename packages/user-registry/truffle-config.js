module.exports = {
  test_file_extension_regexp: /.*\.ts$/,
  networks: {
    development: {
      host: "localhost",
      port: 8548,
      network_id: "*",
      gas: 8000000
    }
  },
  compilers: {
    solc: {
        version: '../../node_modules/solc',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
}
};