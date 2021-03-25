# Configuration - UI
<p>Configuration properties from .env file used by Origin UI</p>

Property | Example value | Additional description 
-----|------|-------
MODE|dev|
BACKEND_URL|http://localhost|
BACKEND_PORT|3030|
UI_BASE_URL|http://localhost:3000|
WEB3|http://localhost:8545|
BLOCKCHAIN_EXPLORER_URL|https://volta-explorer.energyweb.org|URL of service allowing to examine blockchain transactions from the platform
REGISTRATION_MESSAGE_TO_SIGN|I register as Origin user|Registration message used by Metamask 
EXCHANGE_WALLET_PUB|Public key of wallet|Public key for platform's exchange wallet 
DISABLED_UI_FEATURES|DevicesImport;IRecUIApp|All available feature flags are listed in `@energyweb/utils-general` package as `OriginFeature` enum.
DEVICE_PROPERTIES_ENABLED|GRID_OPERATOR,LOCATION|Parts of device data that are used for creating and filtering devices. Used by `DeviceSelectors` component
ISSUER_ID|Issuer ID|Identifier for Issuer-specific devices
SMART_METER_ID|Smart Meter Readings API ID|Identifier for smart meter connected to device
MARKET_UTC_OFFSET|420|UTC offset for keeping precise time of trade in market timezone
DEFAULT_ENERGY_IN_BASE_UNIT|1|Default amount of energy in platform's energy unit
GOOGLE_MAPS_API_KEY|API_KEY|Used for displaying device location on map