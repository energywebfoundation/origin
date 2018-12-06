// // Copyright 2018 Energy Web Foundation
// //
// // This file is part of the Origin Application brought to you by the Energy Web Foundation,
// // a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// // incorporated in Zug, Switzerland.
// //
// // The Origin Application is free software: you can redistribute it and/or modify
// // it under the terms of the GNU General Public License as published by
// // the Free Software Foundation, either version 3 of the License, or
// // (at your option) any later version.
// // This is distributed in the hope that it will be useful,
// // but WITHOUT ANY WARRANTY and without an implied warranty of
// // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// // GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
// //
// // @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

// import * as React from 'react'
// import { ProducingAsset, Certificate, User, AssetType, Compliance, TimeFrame, Currency, Demand } from 'ewf-coo'
// import { Web3Service } from '../utils/Web3Service'
// import { OrganizationFilter } from './OrganizationFilter'
// import { FullDemandProperties } from 'ewf-coo/build/ts/blockchain-facade/Demand'
// import { Table } from '../elements/Table/Table'
// import TableUtils from '../elements/utils/TableUtils'
// import FadeIn from 'react-fade-in'
// import { Nav, NavItem } from 'react-bootstrap'
// import { BrowserRouter, Route, Link, NavLink, Redirect } from 'react-router-dom'

// export interface CertificateTableProps {
//     web3Service: Web3Service,
//     certificates: Certificate[],
//     producingAssets: ProducingAsset[],
//     currentUser: User,
//     baseUrl: string,
//     selectedState: SelectedState,
//     switchedToOrganization: boolean

// }

// export interface EnrichedCertificateData {
//     certificate: Certificate,
//     certificateOwner: User,
//     producingAsset: ProducingAsset

// }

// export interface CertificatesState {
//     enrichedCertificateData: EnrichedCertificateData[],
//     selectedState: SelectedState,
//     detailViewForCertificateId: number
// }

// export interface EnrichedCertificateData {
//     certificate: Certificate,
//     certificateOwner: User,
//     producingAsset: ProducingAsset

// }

// export enum SelectedState {
//     Claimed,
//     Sold,
//     ForSale
// }

// export class CertificateTable extends React.Component<CertificateTableProps, CertificatesState> {

//     constructor(props) {
//         super(props)

//         this.state = {
//             enrichedCertificateData: [],
//             selectedState: SelectedState.Claimed,
//             detailViewForCertificateId: null
//         }

//         this.claimCertificate = this.claimCertificate.bind(this)
//         this.operationClicked = this.operationClicked.bind(this)
//         this.showTxClaimed = this.showTxClaimed.bind(this)
//         this.showCertCreated = this.showCertCreated.bind(this)
//         this.showCertificateDetails = this.showCertificateDetails.bind(this)
//     }

//     async componentDidMount() {
//         await this.enrichData(this.props)

//     }

//     async componentWillReceiveProps(newProps: CertificateTableProps) {
//         await this.enrichData(newProps)
//     }

//     async enrichData(props: CertificateTableProps) {

//         const promieses = props.certificates.map(async (certificate: Certificate, index: number) =>
//             ({
//                 certificate: certificate,
//                 producingAsset: this.props.producingAssets.find((asset: ProducingAsset) => asset.id === certificate.assetId),
//                 certificateOwner: (await (new User(certificate.owner, props.web3Service.blockchainProperties)).syncWithBlockchain())
//             })
//         )

//         Promise.all(promieses).then((enrichedCertificateData) =>
//             this.setState({
//                 enrichedCertificateData: enrichedCertificateData
//             })
//         )

//     }

//     claimCertificate(certificateId: number) {
//         const certificate = this.props.certificates.find((cert: Certificate) => cert.id === certificateId)
//         if (certificate && this.props.currentUser && this.props.currentUser.accountAddress === certificate.owner) {
//             certificate.claim(this.props.currentUser.accountAddress)
//         }
//     }

//     async showTxClaimed(certificateId: number) {
//         const certificate = this.props.certificates.find((cert: Certificate) => cert.id === certificateId)
//         if (certificate ) {
//             const claimedEvent = (await certificate.getCertificateEvents()).find((e) => e.event === 'LogRetireRequest')
//             window.open('https://tobalaba.etherscan.com/tx/' + claimedEvent.transactionHash, claimedEvent.transactionHash)
//         }
//     }

//     async showCertCreated(certificateId: number) {

//         const certificate = this.props.certificates.find((cert: Certificate) => cert.id === certificateId)

//         if (certificate) {
//             const createdEvent = (await certificate.getCertificateEvents()).find((e) => e.event === 'LogCreatedCertificate')
//             window.open('https://tobalaba.etherscan.com/tx/' + createdEvent.transactionHash, createdEvent.transactionHash)
//         }
//     }

//     async showInitialLoggingTx(certificateId: number) {
//         const certificate = this.props.certificates.find((cert: Certificate) => cert.id === certificateId)
//         if (certificate) {
//             const asset = this.props.producingAssets.find((a: ProducingAsset) => a.id === certificate.assetId)
//             const logEvent = (await asset.getEventWithFileHash(certificate.dataLog))[0]
//             console.log(logEvent)
//             window.open('https://tobalaba.etherscan.com/tx/' + logEvent.transactionHash, logEvent.transactionHash)
//         }
//     }

//     async createDemandForCertificate(certificateId: number) {

//         const certificate = this.props.certificates.find((cert: Certificate) => cert.id === certificateId)
//         if (certificate) {

//             let asset = this.props.producingAssets.find((a: ProducingAsset) => a.id === certificate.assetId)
//             if (!asset) {
//                 asset = await (new ProducingAsset(certificate.assetId, this.props.web3Service.blockchainProperties)).syncWithBlockchain()
//             }

//             const creationDemandProperties: FullDemandProperties = {
//                 buyer: this.props.currentUser.accountAddress,
//                 enabledProperties: [false, true, true, true, true, true, true, false, true, true],
//                 originator: asset.owner,
//                 locationCountry: asset.country,
//                 locationRegion: asset.region,
//                 minCO2Offset: ((certificate.coSaved * 1000) / certificate.powerInW) / 10,
//                 otherGreenAttributes: asset.otherGreenAttributes,
//                 typeOfPublicSupport: asset.typeOfPublicSupport,
//                 productingAsset: certificate.assetId,
//                 consumingAsset: 0,
//                 targetWhPerPeriod: certificate.powerInW,
//                 pricePerCertifiedWh: 0,
//                 assettype: asset.assetType,
//                 registryCompliance: asset.complianceRegistry,
//                 timeframe: TimeFrame.yearly,
//                 currency: Currency.USD,
//                 startTime: (await this.props.web3Service.blockchainProperties.web3.eth.getBlock('latest')).timestamp,
//                 endTime: (await this.props.web3Service.blockchainProperties.web3.eth.getBlock('latest')).timestamp + 30 * 86400,
//                 matcher: certificate.escrow
//             }

//             const createdDemand: Demand = await Demand.CREATE_DEMAND(creationDemandProperties, this.props.web3Service.blockchainProperties, this.props.currentUser.accountAddress)

//         }

//     }

//     showCertificateDetails(certificateId: number) {
//         this.setState({
//             detailViewForCertificateId: certificateId
//         })
//     }

//     operationClicked(key: string, id: number) {

//         switch (key) {
//             case 'Claim':
//                 this.claimCertificate(id)
//                 break
//             case 'Buy':
//                 this.createDemandForCertificate(id)
//                 break
//             case 'Show Claiming Tx':
//                 this.showTxClaimed(id)
//                 break
//             case 'Show Certificate Creation Tx':
//                 this.showCertCreated(id)
//                 break
//             case 'Show Initial Logging Transaction':
//                 this.showInitialLoggingTx(id)
//                 break
//             case 'Show Certificate Details':
//                 this.showCertificateDetails(id)
//                 break
//             default:

//         }

//     }

//     render() {
//         if (this.state.detailViewForCertificateId !== null) {
//             return <Redirect push to={'/' + this.props.baseUrl + '/certificates/detail_view/' + this.state.detailViewForCertificateId} />
//         }

//         const defaultWidth = 106
//         const getKey = TableUtils.getKey
//         const generateHeader = (label, width = defaultWidth, right = false, body = false) => (TableUtils.generateHeader(label, width, right, body))
//         const generateFooter = TableUtils.generateFooter

//         const TableFooter = [
//             {
//                 label: 'Total',
//                 key: 'total',
//                 colspan: 9
//             },
//             generateFooter('Certified Energy (kWh)', true)
//         ]

//         const totalGeneratedTags = 0
//         const totalSoldTags = 0
//         const totalTagsForSale = 0
//         const totalCO2Avoided = 0

//         const assets = null
//         const total = null

//         const filteredEnrichedCertificateData = this.state.enrichedCertificateData.filter((enrichedCertificateData: EnrichedCertificateData) => {
//             const claimed = enrichedCertificateData.certificate.retired
//             const forSale = enrichedCertificateData.certificate.owner === enrichedCertificateData.producingAsset.owner

//             if (this.props.switchedToOrganization && enrichedCertificateData.certificate.owner !== this.props.currentUser.accountAddress) {
//                 return false
//             }

//             return (claimed && this.props.selectedState === SelectedState.Claimed)
//                 || (!claimed && forSale && this.props.selectedState === SelectedState.ForSale)
//                 || (!claimed && !forSale && this.props.selectedState === SelectedState.Sold)

//         })

//         const data = filteredEnrichedCertificateData.map((enrichedCertificateData: EnrichedCertificateData) => {
//             const certificate = enrichedCertificateData.certificate

//             return [
//                 certificate.id,
//                 enrichedCertificateData.certificateOwner.organization,
//                 AssetType[enrichedCertificateData.producingAsset.assetType],
//                 new Date(enrichedCertificateData.producingAsset.operationalSince * 1000).toDateString(),
//                 enrichedCertificateData.producingAsset.gpsLongitude + ' ' + enrichedCertificateData.producingAsset.gpsLatitude,
//                 enrichedCertificateData.producingAsset.city + ', ' + enrichedCertificateData.producingAsset.country,
//                 // enrichedCertificateData.producingAsset.capacityWh / 1000,
//                 Compliance[enrichedCertificateData.producingAsset.complianceRegistry],
//                 new Date(enrichedCertificateData.certificate.creationTime * 1000).toDateString(),
//                 (enrichedCertificateData.certificate.coSaved / 1000).toFixed(3),
//                 (enrichedCertificateData.certificate.powerInW / 1000).toFixed(3)
//             ]

//         })

//         const TableHeader = [
//             generateHeader('#', 90.84),
//             generateHeader('Organization', 90.84),
//             generateHeader('Asset Type'),
//             generateHeader('Commissioning Date'),
//             generateHeader('Geo Location'),
//             generateHeader('Town, Country'),
//             // generateHeader('Max Capacity (kWh)', defaultWidth, true),
//             generateHeader('Compliance'),
//             generateHeader('Certification Date'),
//             generateHeader('CO2 saved (kg)'),
//             generateHeader('Certified Energy (kWh)', defaultWidth, true, true)
//         ]

//         const operations = ['Show Certificate Creation Tx', 'Show Initial Logging Transaction', 'Show Certificate Details']
//             .concat(this.props.selectedState === SelectedState.Sold ?
//                 ['Claim'] : this.props.selectedState === SelectedState.ForSale ?
//                     ['Buy'] : [])
//         if (this.props.selectedState === SelectedState.Claimed) {
//             operations.concat(['Show Claiming Tx'])
//         }

//         return <div className='ForSaleWrapper'>
//             <Table operationClicked={this.operationClicked} classNames={['bare-font', 'bare-padding']} header={TableHeader} footer={TableFooter} actions={true} data={data} actionWidth={55.39} operations={operations} />
//         </div>

//     }

// }