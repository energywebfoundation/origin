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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import * as t from './types.d';

export class Web3Type {

  static providers: t.Providers;
  static givenProvider: t.Provider;
  static modules: {
    Eth: new (provider: t.Provider) => t.Eth
    Net: new (provider: t.Provider) => t.Net
    Personal: new (provider: t.Provider) => t.Personal
    Shh: new (provider: t.Provider) => t.Shh
    Bzz: new (provider: t.Provider) => t.Bzz,
  };

  version: string;
  bzz: t.Bzz;
  currentProvider: t.Provider;
  eth: t.Eth;
  ssh: t.Shh;
  givenProvider: t.Provider;
  providers: t.Providers;
  utils: t.Utils;
  BatchRequest: new () => t.BatchRequest;

  // tslint:disable-next-line:no-empty
  constructor(provider: t.Provider) { }

  // tslint:disable-next-line:no-empty
  extend(methods: any): any { }

  // tslint:disable-next-line:no-empty
  setProvider(provider: t.Provider): void { }

}