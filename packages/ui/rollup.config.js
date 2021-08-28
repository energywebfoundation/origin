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
        ethers: 'ethers',
        lodash: 'lodash',
        axios: 'axios',
        yup: 'yup',
        i18next: 'i18n',
        '@ethersproject/providers': 'ethersprojectsProviders',
        '@web3-react/core': 'web3ReactCore',
        '@web3-react/injected-connector': 'web3ReactInjectedConnector',
        'react-router': 'reactRouter',
        'react-router-dom': 'reactRouterDom',
        'react-query': 'reactQuery',
        'react-is': 'reactIs',
        'react/jsx-runtime': 'jsxRuntime',
        'react-chartjs-2': 'reactChartjs2',
        'react-i18next': 'reactI18next',
        'i18next-icu': 'i18nICU',
        '@energyweb/utils-general': 'utilsGeneral',
        '@energyweb/origin-backend-core': 'originBackendCore',
        '@energyweb/issuer': 'issuer',
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
        '@energyweb/origin-ui-blockchain': 'originUiBlockchain',
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
        '@material-ui/core': 'MUICore',
        '@material-ui/core/styles': 'MUICoreStyles',
        '@material-ui/icons': 'MUIIcons',
        '@material-ui/lab': 'MUILab',
        '@react-google-maps/api': 'reactGoogleMapsApi',
        'react-hook-form': 'reactHookForm',
        '@hookform/resolvers': 'hookformResolver',
        'react-material-ui-carousel': 'reactMaterialUiCarousel',
        'react-toastify': 'reactToastify',
        'react-dropzone': 'reactDropzone',
        'react-beautiful-dnd': 'reactBeautifulDnd',
      },
    },
    plugins: [...config.plugins, svgr()],
  };
};
