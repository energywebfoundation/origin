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

// import {
//   NavLink,
//   withRouter
// } from 'react-router-dom'

// // import Profile from '../Profile/Profile'

// import * as logo from '../../assets/logo.svg'
// import * as avatar from '../../assets/avatar.svg'
// import view_profile from '../../assets/view_profile.svg'
// import { User } from 'ewf-coo'

// import './Header.scss'


// export interface HeaderProps {

//   currentUser: User,
//   baseUrl: string,

// }

// export class Header extends React.Component<HeaderProps, {}> {
//   render() {


//     return <div className='HeaderWrapper'>
//       <div className='Header'>
//         <NavLink to='/assets' activeClassName='active'><img src={logo as any} /></NavLink>
//         <Nav className="NavMenu">
//           <li><NavLink to={'/' + this.props.baseUrl + '/assets'} activeClassName='active'>Assets</NavLink></li>
//           <li><NavLink to={'/' + this.props.baseUrl + '/certificates'} activeClassName='active'>Certificates</NavLink></li>
//           <li><NavLink to={'/' + this.props.baseUrl + '/demands'} activeClassName='active'>Demands</NavLink></li>
//           <li><NavLink to={'/' + this.props.baseUrl + '/admin'} activeClassName='active'>Admin</NavLink></li>
//         </Nav>
//         <div className="ViewProfile">
//           <div>
//             <img src={avatar as any} />
//             {this.props.currentUser ? <span>{this.props.currentUser.firstName} {this.props.currentUser.surname}</span> : <span>Guest</span>}
//           </div>
//           <img src={view_profile} />
//         </div>
//       </div>
//       {/* <SlidingPane
//             className='ProfilePane'
//             overlayClassName='ProfilePaneOverlay'
//             width='292px'
//             isOpen={isProfileOpened}
//             onRequestClose={handleProfile.close}>
//             <Profile fakeAuth={fakeAuth} handleProfile={handleProfile} />
//           </SlidingPane> */}
//     </div>

//   }
// }

