import { ProducingDevice } from '@energyweb/device-registry';
import { IEnvironment } from '../features/general/actions';

export function getDeviceId(device: ProducingDevice.Entity, environment: IEnvironment) {
    return (
        device.externalDeviceIds?.find((i) => i.type === environment.ISSUER_ID)?.id ??
        device.id?.toString()
    );
}
