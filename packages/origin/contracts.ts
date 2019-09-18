import CertificateDBJSON from './build/contracts/CertificateDB.json';
import CertificateLogicJSON from './build/contracts/CertificateLogic.json';
import CertificateSpecificContractJSON from './build/contracts/CertificateSpecificContract.json';
import CertificateSpecificDBJSON from './build/contracts/CertificateSpecificDB.json';
import EnergyCertificateBundleDBJSON from './build/contracts/EnergyCertificateBundleDB.json';
import EnergyCertificateBundleLogicJSON from './build/contracts/EnergyCertificateBundleLogic.json';
import EnergyDBJSON from './build/contracts/EnergyDB.json';
import EnergyLogicJSON from './build/contracts/EnergyLogic.json';
import OriginContractLookupJSON from './build/contracts/OriginContractLookup.json';
import TradableEntityContractJSON from './build/contracts/TradableEntityContract.json';
import TradableEntityDBJSON from './build/contracts/TradableEntityDB.json';
import TradableEntityLogicJSON from './build/contracts/TradableEntityLogic.json';

export {
    migrateCertificateRegistryContracts,
    migrateEnergyBundleContracts
} from './src/utils/migrateContracts';

export {
    CertificateDBJSON,
    CertificateLogicJSON,
    CertificateSpecificContractJSON,
    CertificateSpecificDBJSON,
    EnergyCertificateBundleDBJSON,
    EnergyCertificateBundleLogicJSON,
    EnergyDBJSON,
    EnergyLogicJSON,
    OriginContractLookupJSON,
    TradableEntityContractJSON,
    TradableEntityDBJSON,
    TradableEntityLogicJSON
}