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

import * as React from 'react';
import FadeIn from 'react-fade-in';
import * as General from 'ew-utils-general-lib';
import * as marker from '../../assets/marker.svg';
import * as map from '../../assets/map.svg';
import * as wind from '../../assets/icon_wind.svg';
import * as hydro from '../../assets/icon_hydro.svg';
import * as solar from '../../assets/icon_solar.svg';
import moment from 'moment';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import * as OriginIssuer from 'ew-origin-lib';
import * as EwAsset from 'ew-asset-registry-lib'; 
import * as EwUser from 'ew-user-registry-lib';
import { MapContainer } from './MapContainer';
import { ProducingAssetDetailView } from './ProducingAssetDetailView';

import './DetailView.scss';

export interface DetailViewProps {
    conf: General.Configuration.Entity;
  id: number;
  baseUrl: string;
  certificates: OriginIssuer.Certificate.Entity[];
  producingAssets: EwAsset.ProducingAsset.Entity[];
}

export interface DetailViewState {
  newId: number;
  owner: EwUser.User;
  events: EnrichedEvent[];

}

export interface EnrichedEvent {
  txHash: string;
  lable: string;
  description: string;
  timestamp: number;
}

const TableWidth = [210, 210, 210, 210, 407];

export class CertificateDetailView extends React.Component<DetailViewProps, DetailViewState> {
  constructor(props: DetailViewProps) {
    super(props);
    this.state = {
      newId: null,
      owner: null,
      events: []
    };
    this.onInputChange = this.onInputChange.bind(this);

  }

  onInputChange(e) {

    this.setState({ newId: e.target.value });
  }

  componentDidMount() {
    this.init(this.props);

  }

  componentWillReceiveProps(newProps: DetailViewProps) {
    this.init(newProps);
  }

  init(props: DetailViewProps) {
    if (props.id !== null && props.id !== undefined) {
        const selectedCertificate: OriginIssuer.Certificate.Entity = 
        props.certificates.find((c: OriginIssuer.Certificate.Entity) => c.id === props.id.toString());
        if (selectedCertificate) {
   
            this.getOwner(props, selectedCertificate, () => this.enrichEvent(props, selectedCertificate));
        }
      }  

  }

  async getOwner(props: DetailViewProps, selectedCertificate: OriginIssuer.Certificate.Entity, cb) {

    this.setState({
      owner: await (new EwUser.User(selectedCertificate.owner.address, props.conf as any).sync())

    },            cb);

  }

  async enrichEvent(props: DetailViewProps, selectedCertificate: OriginIssuer.Certificate.Entity) {
    const asset = this.props.producingAssets.find((p: EwAsset.ProducingAsset.Entity) => p.id === selectedCertificate.assetId.toString());
    console.log('###')
    console.log(await selectedCertificate.getAllCertificateEvents())
    const jointEvents = (await selectedCertificate.getAllCertificateEvents())
      .map(async (event: any) => {
        let lable;
        let description;

        switch (event.event) {
          case 'LogNewMeterRead':
            lable = 'Initial Logging';
            description = 'Logging by Asset #' + event.returnValues._assetId;
            break;
          case 'LogCreatedCertificate':
            const organization = (await (new EwUser.User(event.returnValues.owner, props.conf as any).sync())).organization;
            lable = 'Certificate Created';
            description = 'Initially owned by ' + organization;
            break;
          case 'LogRetireRequest':
            lable = 'Certificate Claimed';
            description = 'Initiated by ' + this.state.owner.organization;
            break;
          case 'LogCertificateOwnerChanged':
            const newOwner = (await (new EwUser.User((event as any).returnValues._newOwner, props.conf as any).sync())).organization;
            const oldOwner = (await (new EwUser.User((event as any).returnValues._oldOwner, props.conf as any).sync())).organization;
            lable = 'Certificate Owner Change';
            description = 'Ownership changed from ' + oldOwner + ' to ' + newOwner;
            break;
          default:
            lable = event.event;

        }

        return {
          txHash: event.transactionHash,
          lable: lable,
          description: description,
          timestamp: (await props.conf.blockchainProperties.web3.eth.getBlock(event.blockNumber)).timestamp
        };
      });

    Promise.all(jointEvents).then((events) => {

      this.setState({
        events: events as any
      });
    });

  }

  render() {

    const selectedCertificate = this.props.id !== null && this.props.id !== undefined ? 
        this.props.certificates.find((c: OriginIssuer.Certificate.Entity) => c.id === this.props.id.toString()) :
        null;

    let data;
    let events = [];
    if (selectedCertificate) {

      events = this.state.events.reverse().map((event: EnrichedEvent) =>
        <p key={event.txHash}>
          <span className='timestamp text-muted'>{(new Date(event.timestamp * 1000)).toLocaleString()} - <a href={'https://tobalaba.etherscan.com/tx/' + event.txHash} className='text-muted' target='_blank'>{event.txHash}</a></span><br />
          {event.lable} - {event.description}<br />

        </p>);

      const asset = this.props.producingAssets.find((p: EwAsset.ProducingAsset.Entity) => p.id === selectedCertificate.assetId.toString());

      //const jointEvents = asset.getEventWithFileHash(selectedCertificate.dataLog);
      data = [
        [
          {
            label: 'Certificate Id',
            data: selectedCertificate.id
          },
          {
            label: 'Current Owner',
            data: this.state.owner ? this.state.owner.organization : ''
          },
          {
            label: 'Claimed',
            data: selectedCertificate.retired ? 'yes' : 'no'
          },
          {
            label: 'Producing Asset Id',
            data: asset.id,
            link: `/${this.props.baseUrl}/assets/producing_detail_view/${asset.id}`
          },
          {
            label: 'Co2 saved (kg)',
            data: 0//(selectedCertificate.coSaved / 1000).toFixed(3)
          },
          {
            label: 'Certified Energy (kWh)',
            data: (selectedCertificate.powerInW / 1000).toFixed(3)
          },
          {
            label: 'Creation Date',
            data: moment(selectedCertificate.creationTime * 1000).format('DD MMM YY')
          }

        ]
      ];
    }

    return (

      <div className='DetailViewWrapper' >
        <div className='FindAsset'>
          <input onChange={this.onInputChange} defaultValue={this.props.id || this.props.id === 0 ? this.props.id.toString() : ''} />

          <Link className='btn btn-primary find-asset-button' to={`/${this.props.baseUrl}/certificates/detail_view/${this.state.newId}`}>Find Certificate</Link>

        </div>
        <div className='PageContentWrapper'>
          {/* <div className='PageHeader'>
              <div className='PageTitle'>Berlin II, <span>Berlin, Germany</span></div>
            </div> */}
          <div className='PageBody'>
            {!selectedCertificate ?
              <div className='text-center'><strong>Certificate not found</strong></div> :
              <div>
                <table >
                  <tbody>
                    {data.map((row: any) => (
                    
                      <tr key={row.label} >
                       
                        {row.map((col) => (

                          <td key={col.label} rowSpan={col.rowspan || 1} colSpan={col.colspan || 1}>
               
                            <div className='Label'>{col.label}</div>
                            <div className='Data'>{col.data} {col.tip && (<span>{col.tip}</span>)}</div>

                            {col.description && (<div className='Description'>{col.description}</div>)}
                          </td>
                        ))
                        }
                      </tr>
                    ))
                    }
                  </tbody>
                </table>

              </div>
            }

          </div>
          {selectedCertificate ?
            <ProducingAssetDetailView
              id={selectedCertificate.assetId} baseUrl={this.props.baseUrl}
              producingAssets={this.props.producingAssets}
              conf={this.props.conf}
              certificates={this.props.certificates}
              addSearchField={false}
            /> : null}
          {selectedCertificate ?

            <div className='PageBody'>
              <div className='history'>

                <div>{events}</div>
              </div>

            </div> : null}

        </div>
      </div>

    );
  }
}

const addCommas = (intNum) => {
  return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
};
