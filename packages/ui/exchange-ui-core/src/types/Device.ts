import { IOriginDevice } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice, ComposedDevice } from '@energyweb/origin-ui-irec-core';

export type MyDevice = IOriginDevice | ComposedDevice;

export type PublicDevice = IOriginDevice | ComposedPublicDevice;

export type AnyDevice = IOriginDevice | ComposedPublicDevice | ComposedDevice;
