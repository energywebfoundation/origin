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
// import FadeIn from 'react-fade-in'

// import * as marker from '../../assets/marker.svg'
// import * as map from '../../assets/map.svg'
// import * as wind from '../../assets/icon_wind.svg'
// import * as hydro from '../../assets/icon_hydro.svg'
// import * as solar from '../../assets/icon_solar.svg'
// import * as moment from 'moment'
// import { BrowserRouter, Route, Link } from 'react-router-dom'
// import { ProducingAsset, User, Certificate, AssetType, Compliance } from 'ewf-coo'
// import { Web3Service } from '../utils/Web3Service'
// import { MapContainer } from './MapContainer'
// import { ProducingAssetDetailView } from './ProducingAssetDetailView'

// import './DetailView.scss'

// export interface DetailViewProps {
//   web3Service: Web3Service,
//   id: number,
//   baseUrl: string,
//   certificates: Certificate[],
//   producingAssets: ProducingAsset[]
// }

// export interface DetailViewState {
//   newId: number,
//   owner: User,
//   events: EnrichedEvent[]

// }

// export interface EnrichedEvent {
//   txHash: string,
//   lable: string,
//   description: string,
//   timestamp: number
// }

// const TableWidth = [210, 210, 210, 210, 407]

// export class CertificateDetailView extends React.Component<DetailViewProps, DetailViewState> {
//   constructor(props) {
//     super(props)
//     this.state = {
//       newId: null,
//       owner: null,
//       events: []
//     }
//     this.onInputChange = this.onInputChange.bind(this)

//   }

//   onInputChange(e) {

//     this.setState({ newId: e.target.value })
//   }

//   componentDidMount() {
//     this.init(this.props)

//   }

//   componentWillReceiveProps(newProps: DetailViewProps) {
//     this.init(newProps)
//   }

//   init(props: DetailViewProps) {
//     const selectedCertificate = props.certificates.find((c: Certificate) => c.id === props.id)
//     if (selectedCertificate) {
//       this.getOwner(props, selectedCertificate, () => this.enrichEvent(props, selectedCertificate))

//     }

//   }

//   async getOwner(props: DetailViewProps, selectedCertificate: Certificate, cb) {

//     this.setState({
//       owner: await (new User(selectedCertificate.owner, props.web3Service.blockchainProperties).syncWithBlockchain()),

//     },            cb)

//   }

//   async enrichEvent(props: DetailViewProps, selectedCertificate: Certificate) {
//     const asset = this.props.producingAssets.find((p: ProducingAsset) => p.id === selectedCertificate.assetId)
//     const jointEvents = (await asset.getEventWithFileHash(selectedCertificate.dataLog))
//       .concat(await selectedCertificate.getCertificateEvents())
//       .map(async event => {
//         let lable;
//         let description;

//         switch (event.event) {
//           case 'LogNewMeterRead':
//             lable = 'Initial Logging'
//             description = 'Logging by Asset #' + event.returnValues._assetId
//             break
//           case 'LogCreatedCertificate':
//             const organization = (await (new User(event.returnValues.owner, props.web3Service.blockchainProperties).syncWithBlockchain())).organization
//             lable = 'Certificate Created'
//             description = 'Initially owned by ' + organization
//             break;
//           case 'LogRetireRequest':
//             lable = 'Certificate Claimed'
//             description = 'Initiated by ' + this.state.owner.firstName + ' ' + this.state.owner.surname + ' from ' + this.state.owner.organization
//             break;
//           case 'LogCertificateOwnerChanged':
//             const newOwner = (await (new User(event.returnValues._newOwner, props.web3Service.blockchainProperties).syncWithBlockchain())).organization
//             const oldOwner = (await (new User(event.returnValues._oldOwner, props.web3Service.blockchainProperties).syncWithBlockchain())).organization
//             lable = 'Certificate Owner Change'
//             description = 'Ownership changed from ' + oldOwner + ' to ' + newOwner
//             break;
//           default:
//             lable = event.event
//             break;

//         }

//         return {
//           txHash: event.transactionHash,
//           lable: lable,
//           description: description,
//           timestamp: (await props.web3Service.web3.eth.getBlock(event.blockNumber)).timestamp
//         }
//       })

//     Promise.all(jointEvents).then((events) => {

//       this.setState({
//         events: events as any
//       })
//     })

//   }

//   render() {

//     const selectedCertificate = this.props.certificates.find((c: Certificate) => c.id === this.props.id)

//     let data
//     let events = []
//     if (selectedCertificate) {

//       events = this.state.events.reverse().map((event: EnrichedEvent) =>
//         <p key={event.txHash}>
//           <span className='timestamp text-muted'>{(new Date(event.timestamp * 1000)).toLocaleString()} - <a href={'https://tobalaba.etherscan.com/tx/' + event.txHash} className='text-muted' target='_blank'>{event.txHash}</a></span><br />
//           {event.lable} - {event.description}<br />

//         </p>)
//       const asset = this.props.producingAssets.find((p: ProducingAsset) => p.id === selectedCertificate.assetId)

//       const jointEvents = asset.getEventWithFileHash(selectedCertificate.dataLog)
//       data = [
//         [
//           {
//             label: 'Certificate Id',
//             data: selectedCertificate.id
//           },
//           {
//             label: 'Current Owner',
//             data: this.state.owner ? this.state.owner.organization : ''
//           },
//           {
//             label: 'Claimed',
//             data: selectedCertificate.retired ? 'yes' : 'no'
//           },
//           {
//             label: 'Producing Asset Id',
//             data: asset.id,
//             link: `/${this.props.baseUrl}/assets/producing_detail_view/${asset.id}`
//           },
//           {
//             label: 'Co2 saved (kg)',
//             data: (selectedCertificate.coSaved / 1000).toFixed(3)
//           },
//           {
//             label: 'Certified Energy (kWh)',
//             data: (selectedCertificate.powerInW / 1000).toFixed(3)
//           },
//           {
//             label: 'Creation Date',
//             data: moment(selectedCertificate.creationTime * 1000).format('DD MMM YY')
//           }

//         ]
//       ]
//     }

//     return (

//       <div className='DetailViewWrapper' >
//         <div className='FindAsset'>
//           <input onChange={this.onInputChange} defaultValue={this.props.id || this.props.id === 0 ? this.props.id.toString() : ''} />

//           <Link className='btn btn-primary find-asset-button' to={`/${this.props.baseUrl}/certificates/detail_view/${this.state.newId}`}>Find Certificate</Link>

//         </div>
//         <div className='PageContentWrapper'>
//           {/* <div className='PageHeader'>
//               <div className='PageTitle'>Berlin II, <span>Berlin, Germany</span></div>
//             </div> */}
//           <div className='PageBody'>
//             {!selectedCertificate ?
//               <div className='text-center'><strong>Certificate not found</strong></div> :
//               <div>
//                 <table >
//                   <tbody>
//                     {data.map((row: any) => (
                    
//                       <tr key={row.label} >
                       
//                         {row.map((col) => (

//                           <td key={col.label} rowSpan={col.rowspan || 1} colSpan={col.colspan || 1}>
               
//                             <div className='Label'>{col.label}</div>
//                             <div className='Data'>{col.data} {col.tip && (<span>{col.tip}</span>)}</div>

//                             {col.description && (<div className='Description'>{col.description}</div>)}
//                           </td>
//                         ))
//                         }
//                       </tr>
//                     ))
//                     }
//                   </tbody>
//                 </table>

//               </div>
//             }

//           </div>
//           {selectedCertificate ?
//             <ProducingAssetDetailView
//               id={selectedCertificate.assetId} baseUrl={this.props.baseUrl}
//               producingAssets={this.props.producingAssets}
//               web3Service={this.props.web3Service}
//               certificates={this.props.certificates}
//               addSearchField={false}
//             /> : null}
//           {selectedCertificate ?

//             <div className='PageBody'>
//               <div className='history'>

//                 <div>{events}</div>
//               </div>

//             </div> : null}

//         </div>
//       </div>

//     )
//   }
// }

// const addCommas = (intNum) => {
//   return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,')
// }
