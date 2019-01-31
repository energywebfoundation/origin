import * as fs from 'fs';
import Web3 = require('web3');
import { onboard } from './onboarding'
import { logger } from './Logger';

import * as Certificate from 'ew-origin-lib';
import * as User from 'ew-user-registry-lib'
import * as Asset from 'ew-asset-registry-lib'
import * as GeneralLib from 'ew-utils-general-lib';

import { UserContractLookup, UserLogic } from 'ew-user-registry-contracts';
import { AssetContractLookup, AssetProducingRegistryLogic, AssetConsumingRegistryLogic } from 'ew-asset-registry-contracts';
import { OriginContractLookup, CertificateLogic, migrateCertificateRegistryContracts } from 'ew-origin-contracts';
import { deployERC20TestToken, Erc20TestToken, TestReceiver, deployERC721TestReceiver } from 'ew-erc-test-contracts';



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



export const certificateDemo = async() => {

  await onboard()

  const connectionConfig = JSON.parse(fs.readFileSync(process.cwd() + '/connection-config.json', 'utf8').toString());
  const demoConfig = JSON.parse(fs.readFileSync(process.cwd() + '/demo-config.json', 'utf8').toString());
  const contractConfig = JSON.parse(fs.readFileSync(process.cwd() + '/contractConfig.json', 'utf8').toString());

  const web3 = new Web3(connectionConfig.develop.web3);

  const adminPK = demoConfig.topAdminPrivateKey.startsWith('0x') ?
      demoConfig.topAdminPrivateKey : '0x' + demoConfig.topAdminPrivateKey;

  const matcherPK = demoConfig.matcherPrivateKey.startsWith('0x') ?
      demoConfig.matcherPrivateKey : '0x' + demoConfig.matcherPrivateKey;

  const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPK);
  const matcherAccount = web3.eth.accounts.privateKeyToAccount(matcherPK)

  //create logic instances
  const userLogic = new UserLogic(web3, contractConfig.userLogic)
  const assetProducingRegistryLogic = new AssetProducingRegistryLogic(web3, contractConfig.assetProducingRegistryLogic)
  const assetConsumingRegistryLogic = new AssetConsumingRegistryLogic(web3, contractConfig.assetConsumingRegistryLogic)
  const certificateLogic = new CertificateLogic(web3, contractConfig.certificateLogic)

  //set the admin account as an asset admin
  await userLogic.setUser(adminAccount.address, 'admin', { privateKey: adminPK });
  await userLogic.setRoles(adminAccount.address, 3, { privateKey: adminPK });

  //initialize a token to handle demo erc20 trading
  let erc20TestToken: Erc20TestToken

  //blockchain configuration
  let conf: GeneralLib.Configuration.Entity;

  conf = {
      blockchainProperties: {
          activeUser: {
              address: adminAccount.address, privateKey: adminPK,
          },
          producingAssetLogicInstance: assetProducingRegistryLogic,
          consumingAssetLogicInstance: assetConsumingRegistryLogic,
          certificateLogicInstance: certificateLogic,
          userLogicInstance: userLogic,
          web3,
      },
      offChainDataSource: {
          baseUrl: 'http://localhost:3030',
      },
      logger,
  };

  const actionsArray = demoConfig.flow

  for(const action of actionsArray) {
    switch(action.type) {
      case "SAVE_SMARTMETER_READ_PRODUCING":

        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.smartMeter, privateKey: action.data.smartMeterPK,
        };

        try {
          let asset = await (new Asset.ProducingAsset.Entity(action.data.assetId, conf).sync());
          await asset.saveSmartMeterRead(action.data.meterreading, action.data.filehash);
          asset = await asset.sync();
          console.log("Producing smart meter reading saved")
        } catch(e) {
          console.log("Error saving smart meter read for producing asset\n" + e)
        }

        console.log("-----------------------------------------------------------\n")

        break
      case "SAVE_SMARTMETER_READ_CONSUMING":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.smartMeter, privateKey: action.data.smartMeterPK,
        };

        try {
          let asset = await (new Asset.ConsumingAsset.Entity(action.data.assetId, conf).sync());
          await asset.saveSmartMeterRead(action.data.meterreading, action.data.filehash);
          asset = await asset.sync();
          console.log("Consuming meter reading saved")
        } catch(e) {
          console.log("Error saving smart meter read for consuming asset\n" + e)
        }

        console.log("-----------------------------------------------------------\n")

        break

      case "INITIALIZE_CERTIFICATES":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: adminAccount.address, privateKey: adminPK,
        };

        try {
          await assetProducingRegistryLogic.setMarketLookupContract(action.data.assetId, contractConfig.originContractLookup, { privateKey: action.data.assetOwnerPK });
          console.log("Certificates for Asset #" + action.data.assetId + " initialized")
        } catch(e) {
          console.log("Error intializing certificates\n" + e)
        }
        console.log("-----------------------------------------------------------")
        break

      case "TRANSFER_CERTIFICATE":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.assetOwner , privateKey: action.data.assetOwnerPK,
        };

        try {
          console.log("Asset Owner Balance(BEFORE):",(await Certificate.TradableEntity.getBalance(action.data.assetOwner, conf)))
          console.log("Asset Owner Balance(BEFORE):",(await Certificate.TradableEntity.getBalance(action.data.addressTo, conf)))
          const certificate = await (new Certificate.Certificate.Entity(action.data.certId, conf).sync());
          await certificate.transferFrom(action.data.addressTo);
          console.log("Certificate Transferred")
          console.log("Asset Owner Balance(AFTER):",(await Certificate.TradableEntity.getBalance(action.data.assetOwner, conf)))
          console.log("Asset Owner Balance(AFTER):",(await Certificate.TradableEntity.getBalance(action.data.addressTo, conf)))
        } catch(e) {
          console.log("Error transferring certificates\n" + e)
        }


        console.log("-----------------------------------------------------------\n")
        break

      case "SPLIT_CERTIFICATE":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.assetOwner , privateKey: action.data.assetOwnerPK,
        };

        try {
          let certificate = await (new Certificate.Certificate.Entity(action.data.certId, conf).sync());
          await certificate.splitCertificate(action.data.splitValue);
          certificate = await certificate.sync()

          console.log("Certificate Split into:", certificate.children)

          for(const cId of certificate.children) {
            const c = await(new Certificate.Certificate.Entity(cId.toString(), conf).sync());
            console.log("Child Certificate #" + cId + " - PowerInW: " + c.powerInW)
          }

        } catch(e) {
          console.log("Error transferring certificates\n" + e)
        }


        console.log("-----------------------------------------------------------\n")
        break

      case "SET_ERC20_CERTIFICATE":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.assetOwner , privateKey: action.data.assetOwnerPK,
        };

        try{
          let certificate = await (new Certificate.Certificate.Entity(action.data.certId, conf).sync());
          await certificate.setOnChainDirectPurchasePrice(action.data.price);
          certificate = await certificate.sync();

          const erc20TestAddress = (await deployERC20TestToken(
              web3,
              action.data.testAccount,
              adminPK,
          )).contractAddress;

          erc20TestToken = new Erc20TestToken(web3, erc20TestAddress);
          await certificate.setTradableToken(erc20TestAddress);
          certificate = await certificate.sync();
          console.log("Demo ERC token created: " + erc20TestAddress)

        } catch(e) {
          console.log("Error setting ERC20 for certificate trading\n", e)
        }

        console.log("-----------------------------------------------------------\n")

        break
      case "BUY_CERTIFICATE":
        console.log("-----------------------------------------------------------")

        conf.blockchainProperties.activeUser = {
          address: action.data.buyer , privateKey: action.data.buyerPK,
        };


        await erc20TestToken.approve(action.data.assetOwner, action.data.price, { privateKey: action.data.buyerPK })

        try {
          //console.log("Buyer Balance(BEFORE):",(await Certificate.TradableEntity.getBalance(action.data.buyer, conf)))
          console.log(await erc20TestToken.balanceOf(action.data.buyer, {privateKey: action.data.buyerPK}))
          let certificate = await (new Certificate.Certificate.Entity(action.data.certId, conf).sync());
          await certificate.buyCertificate();
          console.log("Certificate Bought")
          certificate = await certificate.sync();
          //console.log("Buyer Balance(AFTER):",(await Certificate.TradableEntity.getBalance(action.data.buyer, conf)))
        } catch(e) {
          console.log("Error buying Certificates\n" + e)
        }

        console.log("-----------------------------------------------------------\n")
        break

      default:
        continue
    }
  }
}

certificateDemo()
