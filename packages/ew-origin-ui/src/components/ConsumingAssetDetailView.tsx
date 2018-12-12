// Copyright 2018 Energy Web Foundation
//
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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as React from 'react'
import FadeIn from 'react-fade-in'

import * as marker from '../../assets/marker.svg'
import * as map from '../../assets/map.svg'
import * as wind from '../../assets/icon_wind.svg'
import * as hydro from '../../assets/icon_hydro.svg'
import * as solar from '../../assets/icon_solar.svg'
import * as moment from 'moment'
import { BrowserRouter, Route, Link } from 'react-router-dom'
import { ConsumingAsset, User, Certificate, AssetType, Compliance } from 'ewf-coo'
import { Web3Service } from '../utils/Web3Service'
import { MapContainer } from './MapContainer'

import './DetailView.scss'

export interface DetailViewProps {
  web3Service: Web3Service,
  id: number,
  baseUrl: string,
  certificates: Certificate[],
  consumingAssets: ConsumingAsset[]
}

export interface DetailViewState {
  newId: number,
  owner: User,
  notSoldCertificates: number

}

const TableWidth = [210, 210, 210, 210, 407]

export class ConsumingAssetDetailView extends React.Component<DetailViewProps, DetailViewState> {
  constructor(props) {
    super(props)
    this.state = {
      newId: null,
      owner: null,
      notSoldCertificates: 0
    }
    this.onInputChange = this.onInputChange.bind(this)

  }

  onInputChange(e) {

    this.setState({ newId: e.target.value })
  }

  async componentDidMount() {
    await this.getOwner(this.props)

  }

  async componentWillReceiveProps(newProps: DetailViewProps) {
    await this.getOwner(newProps)
  }

  async getOwner(props: DetailViewProps) {
    const selectedAsset = props.consumingAssets.find((c: ConsumingAsset) => c.id === props.id)
    if (selectedAsset) {
      if (this.props.certificates.length > 0) {
        this.setState({
          notSoldCertificates: this.props.certificates
            .map((certificate: Certificate) => certificate.owner === selectedAsset.owner && certificate.assetId === selectedAsset.id ?
              certificate.powerInW : 0)
            .reduce((a, b) => a + b)
        })
      }
      this.setState({
        owner: await (new User(selectedAsset.owner, props.web3Service.blockchainProperties).syncWithBlockchain())

      })

    }

  }

  render() {
    
    const selectedAsset = this.props.consumingAssets.find((c: ConsumingAsset) => c.id === this.props.id)
    
    let data
    if (selectedAsset) {
     
      data = [
        [
          {
            label: 'Owner',
            data: this.state.owner ? this.state.owner.organization : ''
          },

          {
            label: 'Kind',
            data: 'Consumption'
          },

          {
            label: 'Geo Location',
            data: selectedAsset.gpsLatitude + ', ' + selectedAsset.gpsLongitude,
            image: map,
            type: 'map',
            rowspan: 3,
            colspan: 2
          }
        ],
        [

          {
            label: 'Commissioning Date',
            data: moment(selectedAsset.operationalSince * 1000).format('DD MMM YY')
          },


          {
            label: 'Nameplate Capacity',
            data: (selectedAsset.maxCapacitySet ? (selectedAsset.capacityWh / 1000).toFixed(3) : '-'),
            tip: 'kW'
          }
        ]
      ]
    }

    return (

      <div className='DetailViewWrapper' >
        <div className='FindAsset'>
          <input onChange={this.onInputChange} defaultValue={this.props.id || this.props.id === 0 ? this.props.id.toString() : ''} />

          <Link className='btn btn-primary find-asset-button' to={`/${this.props.baseUrl}/assets/consuming_detail_view/${this.state.newId}`}>Find Asset</Link>

        </div>
        <div className='PageContentWrapper'>
          {/* <div className='PageHeader'>
              <div className='PageTitle'>Berlin II, <span>Berlin, Germany</span></div>
            </div> */}
          <div className='PageBody'>
            {!selectedAsset ?
              <div className='text-center'><strong>Asset not found</strong></div> :
              <table >
                <tbody>
                  {data.map((row: any) => (
                    <tr key={row.key} >
                    
                      {row.map((col) => (
                        <td key={col.key} rowSpan={col.rowspan || 1} colSpan={col.colspan || 1}>
                        
                          <div className='Label'>{col.label}</div>
                          <div className='Data'>{col.data} {col.tip && (<span>{col.tip}</span>)}</div>
                          {col.image && (
                            col.type !== 'map'
                              ?
                              <div className={`Image`}>
                                <img src={col.image} />
                                {col.type === 'map' && (
                                  <img src={marker as any} className='Marker' />
                                )}
                              </div>
                              :
                              <div className={`Image Map`}>
                                <MapContainer asset={selectedAsset} />

                              </div>
                          )}
                          {col.description && (<div className='Description'>{col.description}</div>)}
                        </td>
                      ))
                      }
                    </tr>
                  ))
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>

    )
  }
}

const addCommas = (intNum) => {
  return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,')
}
