const nrwlConfig = require('@nrwl/react/plugins/bundle-rollup');
const svgr = require('@svgr/rollup').default;

module.exports = (config) => {
  nrwlConfig(config);
  return {
    ...config,
    output: {
      ...config.output,
      globals: {
        ...config.output.globals,
        dayjs: 'dayjs',
        lodash: 'lodash',
        axios: 'axios',
        yup: 'yup',
        i18next: 'i18n',
        clsx: 'clsx',
        'dayjs/plugin/timezone': 'dayjsPluginTimezone',
        'dayjs/plugin/utc': 'dayjsPluginUtc',
        'query-string': 'queryString',
        'react-router': 'reactRouter',
        'react-router-dom': 'reactRouterDom',
        'react-query': 'reactQuery',
        'react-is': 'reactIs',
        'react/jsx-runtime': 'jsxRuntime',
        'react-chartjs-2': 'reactChartjs2',
        'react-i18next': 'reactI18next',
        '@energyweb/utils-general': 'utilsGeneral',
        '@energyweb/origin-backend-core': 'originBackendCore',
        '@energyweb/issuer': 'issuer',
        '@energyweb/issuer/dist/js/src/blockchain-facade/Certificate':
          'issuerBlockchainFacadeCertificate',
        '@energyweb/issuer/dist/js/src/ethers/factories/Issuer__factory':
          'issuerEthersFactoriesIssuerFactory',
        '@energyweb/issuer/dist/js/src/ethers/factories/RegistryExtended__factory':
          'issuerEthersFactoriesRegistryExtendedFactory',
        '@energyweb/origin-backend-react-query-client':
          'originBackendReactQueryClient',
        '@energyweb/origin-device-registry-api-react-query-client':
          'originDeviceRegistryApiReactQueryClient',
        '@energyweb/origin-device-registry-irec-local-api-react-query-client':
          'originDeviceRegistryIrecLocalApiReactQueryClient',
        '@energyweb/issuer-irec-api-react-query-client':
          'issuerIrecApiReactQueryClient',
        '@energyweb/origin-organization-irec-api-react-query-client':
          'originOrganizationIrecApiReactQueryClient',
        '@energyweb/exchange-react-query-client': 'exchangeReactQueryClient',
        '@energyweb/exchange-irec-react-query-client':
          'exchangeIrecReactQueryClient',
        '@energyweb/origin-energy-api-react-query-client':
          'originEnergyApiReactQueryClient',
        '@energyweb/origin-ui-localization': 'originUiLocalization',
        '@energyweb/origin-ui-theme': 'originUiTheme',
        '@energyweb/origin-ui-assets': 'originUiAssets',
        '@energyweb/origin-ui-utils': 'originUiUtils',
        '@energyweb/origin-ui-shared-state': 'originUiSharedState',
        '@energyweb/origin-ui-core': 'originUiCore',
        '@energyweb/origin-ui-web3': 'originUiWeb3',
        '@energyweb/origin-ui-user-data': 'originUiUserData',
        '@energyweb/origin-ui-user-logic': 'originUiUserLogic',
        '@energyweb/origin-ui-organization-data': 'originUiOrganizationData',
        '@energyweb/origin-ui-organization-logic': 'originUiOrganizationLogic',
        '@energyweb/origin-ui-certificate-data': 'originUiCertificateData',
        '@energyweb/origin-ui-certificate-logic': 'originUiCertificateLogic',
        '@energyweb/origin-ui-device-data': 'originUiDeviceData',
        '@energyweb/origin-ui-device-logic': 'originUiDeviceLogic',
        '@energyweb/origin-ui-exchange-data': 'originUiExchangeData',
        '@energyweb/origin-ui-exchange-logic': 'originUiExchangeLogic',
        '@mui/material': 'MUIMaterial',
        '@mui/material/styles': 'MUIMaterialStyles',
        '@mui/styles': 'MUIStyles',
        '@mui/icons-material': 'MUIIconsMaterial',
        '@mui/lab': 'MUILab',
        '@mui/lab/AdapterDayjs': 'MUILabAdapterDayjs',
        '@mui/material/locale': 'MUIMaterialLocale',
        '@react-google-maps/api': 'reactGoogleMapsApi',
        'react-hook-form': 'reactHookForm',
        '@hookform/resolvers': 'hookformResolvers',
        '@hookform/resolvers/yup': 'hookformResolversYup',
        'react-toastify': 'reactToastify',
        'react-dropzone': 'reactDropzone',
        'react-beautiful-dnd': 'reactBeautifulDnd',
        '@ethersproject/providers': 'ethersprojectProviders',
        '@ethersproject/bignumber': 'ethersprojectBigNumber',
        '@ethersproject/address': 'ethersprojectAddress',
        '@ethersproject/units': 'ethersprojectUnits',
        'chart.js': 'chartJs',
      },
    },
    plugins: [...config.plugins, svgr()],
  };
};
