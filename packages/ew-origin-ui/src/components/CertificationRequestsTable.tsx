import * as React from 'react';

import { Configuration } from 'ew-utils-general-lib';

import { Table } from '../elements/Table/Table';
import TableUtils from '../elements/utils/TableUtils';
import { CertificateLogic } from 'ew-origin-lib';
import { ProducingAsset } from 'ew-asset-registry-lib';
import { User, Role } from 'ew-user-registry-lib';
import { showNotification, NotificationType } from '../utils/notifications';
import { PaginatedLoader, IPaginatedLoaderState, DEFAULT_PAGE_SIZE, IPaginatedLoaderFetchDataParameters, IPaginatedLoaderFetchDataReturnValues } from '../elements/Table/PaginatedLoader';

interface ICertificateTableProps {
    conf: Configuration.Entity;
    producingAssets: ProducingAsset.Entity[];
    currentUser: User;
    approvedOnly?: boolean;
}

enum OPERATIONS {
    APPROVE = 'Approve'
}

export class CertificationRequestsTable extends PaginatedLoader<ICertificateTableProps, IPaginatedLoaderState> {
    constructor(props: ICertificateTableProps) {
        super(props);

        this.state = {
            data: [],
            pageSize: DEFAULT_PAGE_SIZE,
            total: 0
        };

        this.operationClicked = this.operationClicked.bind(this);
    }

    async componentDidMount() {
        this.loadPage(1);
    }

    async componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.loadPage(1);
        }
    }

    async getPaginatedData({ pageSize, offset }: IPaginatedLoaderFetchDataParameters): Promise<IPaginatedLoaderFetchDataReturnValues> {
        if (!this.props.currentUser) {
            return {
                data: [],
                total: 0
            };
        }

        const view = this.props.approvedOnly ? 'approved' : 'pending';

        const isIssuer = this.props.currentUser.isRole(Role.Issuer);

        const certificateLogic : CertificateLogic = this.props.conf.blockchainProperties.certificateLogicInstance;

        const requests = await certificateLogic.getCertificationRequests();

        let data = [];

        for (let i = 0; i < requests.length; i++) {
            const request = requests[i];
            const asset = this.props.producingAssets.find(a => a.id === request.assetId);

            if (
                (view === 'pending' && Number(request.status) !== 0) ||
                (view === 'approved' && Number(request.status) !== 1) ||
                (!isIssuer && this.props.currentUser.id.toLowerCase() !== asset.owner.address.toLowerCase())
            ) {
                continue;
            }

            const reads = await asset.getSmartMeterReads();

            const energy = reads.slice(request.readsStartIndex, Number(request.readsEndIndex) + 1).reduce((a, b) => a + Number(b.energy), 0);

            data.push([
                i,
                asset.offChainProperties.facilityName,
                asset.offChainProperties.city +
                        ', ' +
                        asset.offChainProperties.country,
                ProducingAsset.Type[asset.offChainProperties.assetType],
                asset.offChainProperties.capacityWh / 1000,
                energy / 1000
            ]);
        }
        
        const total = data.length;
        data = data.slice(offset, offset + pageSize);

        return {
            data,
            total
        }
    }
   
    render() {
        const defaultWidth = 106;
        const generateHeader = (label, width = defaultWidth, right = false, body = false) =>
            TableUtils.generateHeader(label, width, right, body);
        const generateFooter = TableUtils.generateFooter;

        const TableHeader = [
            generateHeader('#', 60),
            generateHeader('Facility'),
            generateHeader('Town, Country'),
            generateHeader('Type'),
            generateHeader('Capacity (kW)'),
            generateHeader('Meter Read (kWh)')
        ];

        const TableFooter = [
            {
                label: 'Total',
                key: 'total',
                colspan: TableHeader.length - 1
            },
            generateFooter('Meter Read (kWh)', true)
        ];

        let operations;

        const isIssuer = this.props.currentUser && this.props.currentUser.isRole(Role.Issuer);

        if (isIssuer && !this.props.approvedOnly) {
            operations = [
                OPERATIONS.APPROVE
            ];
        }

        return (
            <div className="CertificateTableWrapper">
                <Table
                    classNames={['bare-font', 'bare-padding']}
                    header={TableHeader}
                    footer={TableFooter}
                    actions={true}
                    actionWidth={55}
                    data={this.state.data}
                    operations={operations}
                    operationClicked={this.operationClicked}
                    loadPage={this.loadPage}
                    total={this.state.total}
                    pageSize={this.state.pageSize}
                />
            </div>
        );
    }

    async approve(id: number) {
        const certificateLogic : CertificateLogic = this.props.conf.blockchainProperties.certificateLogicInstance;

        try {
            this.props.conf.blockchainProperties.activeUser = {
                address: this.props.currentUser.id
            };

            await certificateLogic.approveCertificationRequest(id);

            showNotification(`Certification request approved.`, NotificationType.Success);

            await this.loadPage(1);
        } catch (error) {
            showNotification(`Could not approve certification request.`, NotificationType.Error);
            console.error(error);
        }
    }

    async operationClicked(key: string, id: number) {
        switch (key) {
            case OPERATIONS.APPROVE:
                this.approve(id);
                break;
            default:
                break;
        }
    }
}
