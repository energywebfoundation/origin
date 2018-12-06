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
// import { Nav } from 'react-bootstrap'
// import FadeIn from 'react-fade-in'

// import {
//   NavLink,
//   Redirect,
//   Route,
//   withRouter
// } from 'react-router-dom'

// import { PageContent } from '../elements/PageContent/PageContent'
// import { OnboardDemand } from './OnboardDemand'
// import { Web3Service } from '../utils/Web3Service'
// import { User } from 'ewf-coo'

// export interface AdminProps {
//   web3Service: Web3Service,
//   currentUser: User,
//   baseUrl: string
// }

// export class Admin extends React.Component<AdminProps, {}> {

//   constructor(props) {
//     super(props)
//     this.OnboardDemand = this.OnboardDemand.bind(this)

//   }

//   OnboardDemand() {

//     return <OnboardDemand web3Service={this.props.web3Service} currentUser={this.props.currentUser} />
//   }

//   render() {

//     const AdminMenu = [
//       {
//         key: 'onboard_demand',
//         label: 'Onboard demand',
//         component: this.OnboardDemand
//       }, {
//         key: 'onboard_user',
//         label: 'Onboard user',
//         component: null
//       }, {
//         key: 'onborad_assets',
//         label: 'Onboard assets',
//         component: null
//       }
//     ]

//     const { match } = this.props as any
//     const baseUrl = this.props.baseUrl
//     return (
//       <div className='PageWrapper'>
//         <div className='PageNav'>
//           <Nav className='NavMenu'>
//             {

//               AdminMenu.map(menu => {
//                 return (<li><NavLink exact to={`/${baseUrl}/admin/${menu.key}`} activeClassName='active'>{menu.label}</NavLink></li>)
//               })
//             }
//           </Nav>
//         </div>

//         <Route path={`/${baseUrl}/admin/:key`} render={props => {
//           const key = props.match.params.key
//           const matches = AdminMenu.filter(item => {
//             return item.key === key
//           })
//           return (<PageContent menu={matches.length > 0 ? matches[0] : null} redirectPath={`${baseUrl}/admin`} />)
//         }} />
//         <Route exact path={`/${baseUrl}/admin`} render={props => (<Redirect to={{ pathname: `/${baseUrl}/admin/${AdminMenu[0].key}` }} />)} />

//       </div>
//     )
//   }
// }
