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
import {
  NavLink,
  withRouter
} from 'react-router-dom'

import * as outline from '../../assets/outline-o.svg'
import * as ewfLogo from '../../assets/EWF.png'
import './Footer.scss'

const FooterLinks = [
  {
    key: 'about',
    label: 'About'
  },
  {
    key: 'legal',
    label: 'Legal'
  },
]

interface FooterProps {
  cooContractAddress: string
}

export class Footer extends React.Component<FooterProps, {}> {
  render() {

    return <div className='FooterWrapper'>
      <div className='FooterInfo'>
        <div className='Footer Login'>
        <img src={ewfLogo as any}/>&nbsp;
          © 2018 // Energy Web Foundation&nbsp;
            <a href='http://energyweb.org'><img src={outline as any} /></a>
        </div>
      </div>
      <div className='FooterNav'>
        {
          FooterLinks.map(link => {
            return (<div className='NavItem' key={link.key}><NavLink to={`/${this.props.cooContractAddress}/${link.key}`} activeClassName='active'>{link.label}</NavLink></div>)
          })
        }
      </div>
    </div>

  }
}