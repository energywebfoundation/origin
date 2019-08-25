// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

import * as React from 'react';
import Web3 from 'web3';
import * as queryString from 'query-string';
import * as Winston from 'winston';

import { ProducingAsset, ConsumingAsset } from '@energyweb/asset-registry';
import { Configuration, ContractEventHandler, EventHandlerManager } from '@energyweb/utils-general';
import {
    Demand,
    createBlockchainProperties as marketCreateBlockchainProperties
} from '@energyweb/market';
import { Certificate, createBlockchainProperties } from '@energyweb/origin';
import { User } from '@energyweb/user-registry';

import { Certificates } from './Certificates';
import { Route, Switch } from 'react-router-dom';
import { IStoreState } from '../types';
import { Header } from './Header';
import { Asset } from './Asset';
import { Admin } from './Admin';
import './AppContainer.scss';
import { Demands } from './Demands';
import { AccountChangedModal } from '../elements/Modal/AccountChangedModal';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    currentUserUpdated,
    configurationUpdated,
    demandCreatedOrUpdated,
    demandDeleted,
    producingAssetCreatedOrUpdated,
    certificateCreatedOrUpdated,
    consumingAssetCreatedOrUpdated
} from '../features/actions';
import { withRouter } from 'react-router-dom';
import { ErrorComponent } from './ErrorComponent';
import { LoadingComponent } from './LoadingComponent';
import {
    TSetOriginContractLookupAddress,
    setOriginContractLookupAddress
} from '../features/contracts/actions';
import {
    getBaseURL,
    getConfiguration,
    constructBaseURL,
    getCurrentUser
} from '../features/selectors';
import { getAssetsLink, getCertificatesLink, getAdminLink, getDemandsLink } from '../utils/routing';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3030';

interface RouterProps {
    match: any;
    location: any;
    history: any;
}

interface StateProps {
    baseURL: string;
    certificates: Certificate.Entity[];
    configuration: Configuration.Entity;
    consumingAssets: ConsumingAsset.Entity[];
    currentUser: User;
    demands: Demand.Entity[];
    producingAssets: ProducingAsset.Entity[];
}

interface DispatchProps {
    certificateCreatedOrUpdated: Function;
    currentUserUpdated: Function;
    consumingAssetCreatedOrUpdated: Function;
    demandCreatedOrUpdated: Function;
    demandDeleted: Function;
    producingAssetCreatedOrUpdated: Function;
    configurationUpdated: Function;
    setOriginContractLookupAddress: TSetOriginContractLookupAddress;
}

type Props = RouterProps & StateProps & DispatchProps;

interface IAppContainerState {
    loading: boolean;
    error: string;
}

function isDemandDeleted(demand: Demand.Entity) {
    return !demand || !demand.demandOwner;
}

enum ERROR {
    WRONG_NETWORK_OR_CONTRACT_ADDRESS = "Please make sure you've chosen correct blockchain network and the contract address is valid."
}

class AppContainerClass extends React.Component<Props, IAppContainerState> {
    constructor(props: Props) {
        super(props);

        this.CertificateTable = this.CertificateTable.bind(this);
        this.DemandTable = this.DemandTable.bind(this);
        this.Admin = this.Admin.bind(this);
        this.Asset = this.Asset.bind(this);

        this.state = {
            loading: true,
            error: null
        };
    }

    async initEventHandler(conf: Configuration.Entity): Promise<void> {
        const currentBlockNumber: number = await conf.blockchainProperties.web3.eth.getBlockNumber();
        const certificateContractEventHandler: ContractEventHandler = new ContractEventHandler(
            conf.blockchainProperties.certificateLogicInstance,
            currentBlockNumber
        );

        certificateContractEventHandler.onEvent('LogCertificateRetired', async (event: any) =>
            this.props.certificateCreatedOrUpdated(
                await new Certificate.Entity(
                    event.returnValues._certificateId,
                    this.props.configuration
                ).sync()
            )
        );

        certificateContractEventHandler.onEvent('LogCertificateSplit', async (event: any) =>
            this.props.certificateCreatedOrUpdated(
                await new Certificate.Entity(
                    event.returnValues._certificateId,
                    this.props.configuration
                ).sync()
            )
        );

        certificateContractEventHandler.onEvent('Transfer', async (event: any) => {
            this.props.certificateCreatedOrUpdated(
                await new Certificate.Entity(
                    event.returnValues._tokenId,
                    this.props.configuration
                ).sync()
            );
        });

        certificateContractEventHandler.onEvent('LogPublishForSale', async (event: any) => {
            this.props.certificateCreatedOrUpdated(
                await new Certificate.Entity(
                    event.returnValues._entityId,
                    this.props.configuration
                ).sync()
            );
        });

        certificateContractEventHandler.onEvent('LogUnpublishForSale', async (event: any) => {
            this.props.certificateCreatedOrUpdated(
                await new Certificate.Entity(
                    event.returnValues._entityId,
                    this.props.configuration
                ).sync()
            );
        });

        const demandContractEventHandler: ContractEventHandler = new ContractEventHandler(
            conf.blockchainProperties.marketLogicInstance,
            currentBlockNumber
        );

        demandContractEventHandler.onEvent('createdNewDemand', async (event: any) => {
            const demandAlreadyExists = this.props.demands.some(
                d => d.id === event.returnValues._demandId
            );

            if (demandAlreadyExists) {
                return;
            }

            const demand = await new Demand.Entity(
                event.returnValues._demandId,
                this.props.configuration
            ).sync();

            if (!isDemandDeleted(demand)) {
                this.props.demandCreatedOrUpdated(demand);
            }
        });

        demandContractEventHandler.onEvent('deletedDemand', async (event: any) =>
            this.props.demandDeleted(
                await new Demand.Entity(
                    event.returnValues._demandId,
                    this.props.configuration
                ).sync()
            )
        );

        const eventHandlerManager: EventHandlerManager = new EventHandlerManager(4000, conf);
        eventHandlerManager.registerEventHandler(certificateContractEventHandler);
        eventHandlerManager.registerEventHandler(demandContractEventHandler);
        eventHandlerManager.start();
    }

    async getMarketLogicInstance(originIssuerContractLookupAddress: string, web3: Web3) {
        const response = await axios.get(
            `${API_BASE_URL}/OriginContractLookupMarketLookupMapping/${originIssuerContractLookupAddress.toLowerCase()}`
        );

        const marketBlockchainProperties: Configuration.BlockchainProperties = (await marketCreateBlockchainProperties(
            web3,
            response.data.marketContractLookup
        )) as any;

        return marketBlockchainProperties.marketLogicInstance;
    }

    async initConf(originIssuerContractLookupAddress: string): Promise<Configuration.Entity> {
        let web3: Web3 = null;
        const params: any = queryString.parse(this.props.location.search);

        if (params.rpc) {
            web3 = new Web3(params.rpc);
        } else if ((window as any).ethereum) {
            web3 = new Web3((window as any).ethereum);
            try {
                // Request account access if needed
                await (window as any).ethereum.enable();
            } catch (error) {
                // User denied account access...
            }
        } else if ((window as any).web3) {
            web3 = new Web3(web3.currentProvider);
        }

        let blockchainProperties: Configuration.BlockchainProperties;

        try {
            blockchainProperties = await createBlockchainProperties(
                web3,
                originIssuerContractLookupAddress
            );

            blockchainProperties.marketLogicInstance = await this.getMarketLogicInstance(
                originIssuerContractLookupAddress,
                web3
            );

            this.setState({
                error: null,
                loading: false
            });

            return {
                blockchainProperties,
                offChainDataSource: {
                    baseUrl: API_BASE_URL
                },

                logger: Winston.createLogger({
                    level: 'debug',
                    format: Winston.format.combine(
                        Winston.format.colorize(),
                        Winston.format.simple()
                    ),
                    transports: [new Winston.transports.Console({ level: 'silly' })]
                })
            };
        } catch (error) {
            console.error('Error in AppContainer::initConf', error);
            this.setState({
                loading: false,
                error: ERROR.WRONG_NETWORK_OR_CONTRACT_ADDRESS
            });
        }
    }

    async getOriginContractLookupAddressFromAPI(): Promise<string> {
        const response = await axios.get(
            `${API_BASE_URL}/OriginContractLookupMarketLookupMapping/`
        );

        if (!response.data) {
            return null;
        }

        const originContracts = Object.keys(response.data);

        if (originContracts.length > 0) {
            return originContracts[originContracts.length - 1];
        }
    }

    async componentDidMount(): Promise<void> {
        let contractAddress = this.props.match.params.contractAddress;

        if (contractAddress) {
            this.props.setOriginContractLookupAddress(contractAddress);
        } else {
            contractAddress = await this.getOriginContractLookupAddressFromAPI();

            if (contractAddress) {
                this.props.setOriginContractLookupAddress(contractAddress);

                this.props.history.push(constructBaseURL(contractAddress));
            } else {
                this.setState({
                    error: ERROR.WRONG_NETWORK_OR_CONTRACT_ADDRESS
                });
            }
        }

        const conf = await this.initConf(contractAddress);

        if (!conf) {
            return;
        }

        this.props.configurationUpdated(conf);
        const accounts: string[] = await conf.blockchainProperties.web3.eth.getAccounts();

        const currentUser: User =
            accounts.length > 0 ? await new User(accounts[0], conf as any).sync() : null;

        (await ProducingAsset.getAllAssets(conf)).forEach((p: ProducingAsset.Entity) =>
            this.props.producingAssetCreatedOrUpdated(p)
        );

        (await ConsumingAsset.getAllAssets(conf)).forEach((c: ConsumingAsset.Entity) =>
            this.props.consumingAssetCreatedOrUpdated(c)
        );

        (await Demand.getAllDemands(conf)).forEach((d: Demand.Entity) => {
            if (!isDemandDeleted(d)) {
                this.props.demandCreatedOrUpdated(d);
            }
        });

        (await Certificate.getActiveCertificates(conf)).forEach((certificate: Certificate.Entity) =>
            this.props.certificateCreatedOrUpdated(certificate)
        );

        this.props.currentUserUpdated(
            currentUser !== null && currentUser.active ? currentUser : null
        );

        this.initEventHandler(conf);
    }

    Asset() {
        return (
            <Asset
                certificates={this.props.certificates}
                producingAssets={this.props.producingAssets}
                demands={this.props.demands}
                consumingAssets={this.props.consumingAssets}
                conf={this.props.configuration}
                currentUser={this.props.currentUser}
                baseUrl={this.props.match.params.contractAddress}
            />
        );
    }

    CertificateTable() {
        return (
            <Certificates
                baseUrl={this.props.match.params.contractAddress}
                producingAssets={this.props.producingAssets}
                certificates={this.props.certificates}
                demands={this.props.demands}
                conf={this.props.configuration}
                currentUser={this.props.currentUser}
            />
        );
    }

    DemandTable() {
        return (
            <Demands
                conf={this.props.configuration}
                demands={this.props.demands}
                consumingAssets={this.props.consumingAssets}
                producingAssets={this.props.producingAssets}
                currentUser={this.props.currentUser}
                baseUrl={this.props.match.params.contractAddress}
            />
        );
    }

    Admin() {
        return (
            <Admin
                conf={this.props.configuration}
                currentUser={this.props.currentUser}
                producingAssets={this.props.producingAssets}
                baseUrl={this.props.match.params.contractAddress}
            />
        );
    }

    render(): JSX.Element {
        const { baseURL, configuration } = this.props;
        const { error, loading } = this.state;

        if (error) {
            return <ErrorComponent message={error} />;
        }

        if (configuration === null || loading) {
            return <LoadingComponent />;
        }

        return (
            <div className={`AppWrapper`}>
                <Header />
                <Switch>
                    <Route path={getAssetsLink(baseURL)} component={this.Asset} />
                    <Route path={getCertificatesLink(baseURL)} component={this.CertificateTable} />
                    <Route path={getAdminLink(baseURL)} component={this.Admin} />
                    <Route path={getDemandsLink(baseURL)} component={this.DemandTable} />

                    <Route path={baseURL} component={this.Asset} />
                </Switch>
                <AccountChangedModal />
            </div>
        );
    }
}

export const AppContainer = connect(
    (state: IStoreState) => ({
        baseURL: getBaseURL(state),
        certificates: state.certificates,
        configuration: getConfiguration(state),
        consumingAssets: state.consumingAssets,
        currentUser: getCurrentUser(state),
        demands: state.demands,
        producingAssets: state.producingAssets
    }),
    dispatch =>
        bindActionCreators(
            {
                currentUserUpdated,
                configurationUpdated,
                demandCreatedOrUpdated,
                demandDeleted,
                producingAssetCreatedOrUpdated,
                certificateCreatedOrUpdated,
                consumingAssetCreatedOrUpdated,
                setOriginContractLookupAddress
            },
            dispatch
        )
)(withRouter(AppContainerClass));
