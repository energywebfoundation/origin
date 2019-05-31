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
import { Table } from '../elements/Table/Table';
import { User } from 'ew-user-registry-lib';
import { AssetType, TimeFrame, Currency, Configuration } from 'ew-utils-general-lib';
import { Compliance } from 'ew-asset-registry-lib/dist/js/src/blockchain-facade/ProducingAsset';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { Demand } from 'ew-market-lib';
import { showNotification, NotificationType } from '../utils/notifications';

export interface IOnboardDemandProps {
    configuration: Configuration.Entity;
    currentUser: User;
    producingAssets: ProducingAsset.Entity[];
}

export class OnboardDemand extends React.Component<IOnboardDemandProps, {}> {
    constructor(props) {
        super(props);
        this.createDemand = this.createDemand.bind(this);
    }

    async createDemand(input: any) {
        const creationDemandProperties = {
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            pricePerCertifiedWh: 0,
            assettype: AssetType.Wind,
            registryCompliance: Compliance.none,
            timeframe: TimeFrame.yearly,
            currency: Currency.Euro
        };

        const transformedInput = { ...input };

        if (typeof(transformedInput.timeframe) !== 'undefined') {
            transformedInput.timeframe = TimeFrame[transformedInput.timeframe];
        }

        if (typeof(transformedInput.assettype) !== 'undefined') {
            transformedInput.assettype = AssetType[transformedInput.assettype];
        }

        if (typeof(transformedInput.consumingAsset) !== 'undefined') {
            transformedInput.consumingAsset = parseInt(transformedInput.consumingAsset, 10);
        }
        if (typeof(transformedInput.minCO2Offset) !== 'undefined') {
            transformedInput.minCO2Offset = parseInt(transformedInput.minCO2Offset, 10);
        }
        if (typeof(transformedInput.productingAsset) !== 'undefined') {
            transformedInput.productingAsset = parseInt(transformedInput.productingAsset, 10);
        }

        if (typeof(transformedInput.targetWhPerPeriod) !== 'undefined') {
            transformedInput.targetWhPerPeriod = parseInt(transformedInput.targetWhPerPeriod, 10);
        }

        transformedInput.targetWhPerPeriod = transformedInput.targetWhPerPeriod * 1000;

        const demandOffchainProps: Demand.IDemandOffChainProperties = {
            timeframe: transformedInput.timeframe,
            pricePerCertifiedWh: creationDemandProperties.pricePerCertifiedWh,
            currency: creationDemandProperties.currency,
            otherGreenAttributes: creationDemandProperties.otherGreenAttributes,
            typeOfPublicSupport: creationDemandProperties.typeOfPublicSupport,
            targetWhPerPeriod: transformedInput.targetWhPerPeriod,
            registryCompliance: creationDemandProperties.registryCompliance
        };

        if (typeof transformedInput.productingAsset !== 'undefined') {
            demandOffchainProps.productingAsset = transformedInput.productingAsset;
        }

        if (typeof transformedInput.consumingAsset !== 'undefined') {
            demandOffchainProps.consumingAsset = transformedInput.consumingAsset;
        }

        if (typeof transformedInput.assettype !== 'undefined') {
            demandOffchainProps.assettype = transformedInput.assettype;
        }

        if (typeof transformedInput.minCO2Offset !== 'undefined') {
            demandOffchainProps.minCO2Offset = transformedInput.minCO2Offset;
        }

        if (typeof transformedInput.locationCountry !== 'undefined') {
            demandOffchainProps.locationCountry = transformedInput.locationCountry;
        }

        if (typeof transformedInput.locationRegion !== 'undefined') {
            demandOffchainProps.locationRegion = transformedInput.locationRegion;
        }

        if (typeof(transformedInput.registryCompliance) !== 'undefined') {
            demandOffchainProps.registryCompliance = Compliance[transformedInput.registryCompliance] as any as Compliance;
        }

        const demandProps: Demand.IDemandOnChainProperties = {
            url: '',
            propertiesDocumentHash: '',
            demandOwner: this.props.currentUser.id
        };

        try {
            this.props.configuration.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };

            await Demand.createDemand(demandProps, demandOffchainProps, this.props.configuration);

            showNotification('Demand created', NotificationType.Success);
        } catch (error) {
            console.error('Error in OnboardDemand: ', error);
            showNotification(`Can't create demand`, NotificationType.Error);
        }
    }

    render() {
        const Tables = [
            {
                header: 'General'
            },
            {
                data: [
                    {
                        label: 'Cap per Timeframe (kWh)',
                        key: 'targetWhPerPeriod',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    },

                    {
                        label: 'Timeframe',
                        key: 'timeframe',
                        toggle: { hide: true, description: '' },
                        input: {
                            type: 'select',
                            data: 'timeframes'
                        }
                    },
                    {
                        label: 'Start Date',
                        key: 'startTime',
                        toggle: { hide: true, description: '' },
                        input: { type: 'date' }
                    },
                    {
                        label: 'End Date',
                        key: 'endTime',
                        toggle: { hide: true, description: '' },
                        input: { type: 'date' }
                    },
                    {
                        label: 'Total Demand (kWh)',
                        key: 'totalDemand',
                        toggle: { hide: true, description: '' },
                        input: { type: 'text' }
                    }
                ]
            },
            {
                header: 'Criteria'
            },
            {
                data: [
                    {
                        label: 'Min CO2 Offset',
                        key: 'minCO2Offset',

                        toggle: {
                            label: 'All',
                            index: 5,
                            description: 'Only if the CO2 saved is above'
                        },
                        input: { type: 'text' }
                    }
                ]
            },
            {
                header: 'Location'
            },
            {
                data: [
                    {
                        label: 'Country',
                        key: 'locationCountry',
                        toggle: {
                            index: 3,
                            label: 'All',
                            description: 'Only this Country',
                            default: false
                        },
                        input: {
                            type: 'text'
                        }
                    },
                    {
                        label: 'Region',
                        key: 'locationRegion',
                        toggle: {
                            label: 'All',
                            index: 4,
                            description: 'Only this Region'
                        },
                        input: {
                            type: 'text'
                        }
                    }
                ]
            },
            {
                header: 'Type'
            },
            {
                data: [
                    {
                        label: 'Asset Type',
                        key: 'assettype',
                        toggle: {
                            label: 'All',
                            index: 1,
                            description: 'Only this Asset Type'
                        },
                        input: {
                            type: 'select',
                            data: 'assetTypes'
                        }
                    },
                    {
                        label: 'Compliance',
                        key: 'registryCompliance',
                        toggle: {
                            index: 2,
                            label: 'All',
                            description: 'Only if compliant to'
                        },
                        input: {
                            type: 'select',
                            data: 'compliances'
                        }
                    }
                ]
            },
            {
                header: 'Consumption'
            },
            {
                data: [
                    {
                        label: 'Coupled to Production Asset',
                        key: 'productingAsset',
                        toggle: {
                            label: 'No',
                            index: 6,
                            description: 'Yes, coupled to this producing Asset',
                            default: false,
                            key: 'consumptionKey1'
                        },
                        input: { type: 'text' }
                    },
                    {
                        label: 'Coupled to Consumption',
                        key: 'consumingAsset',
                        toggle: {
                            label: 'No',
                            index: 7,
                            description: 'Yes, coupled to this consumption address',
                            default: false,
                            key: 'consumptionKey1'
                        },
                        input: { type: 'text' }
                    }
                ]
            },
            {
                header: true,
                footer: 'Create Demand',
                footerClick: this.createDemand
            }
        ];

        const assetTypes = ['Wind', 'Solar', 'RunRiverHydro', 'BiomassGas'];
        const compliances = ['none', 'IREC', 'EEC', 'TIGR'];
        const timeframes = ['yearly', 'monthly', 'daily'];

        return (
            <div className="OnboardDemandWrapper">
                <Table
                    type="admin"
                    header={Tables}
                    data={{ assetTypes, compliances, timeframes }}
                />
            </div>
        );
    }
}
