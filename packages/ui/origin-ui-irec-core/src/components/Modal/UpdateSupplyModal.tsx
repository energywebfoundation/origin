// import React from 'react';
// import { useSelector } from 'react-redux';
// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     TextField,
//     DialogActions,
//     Button,
//     MenuItem
// } from '@material-ui/core';
// import { IDevice } from '@energyweb/origin-backend-core';
// import { showNotification, NotificationType, useTranslation } from '@energyweb/origin-ui-core';
// import { getDeviceClient } from '../../features/general';
// import { DeviceClient } from '../../utils/client';
// import { KeyStatus } from '../../containers/AutoSupplyDevices';

// interface IProps {
//     showModal: boolean;
//     setShowModal: (value: React.SetStateAction<boolean>) => void;
//     entity: IDevice;
//     setEntity: (value: React.SetStateAction<IDevice>) => void;
//     loadPage: (page: number) => void;
// }

// export function UpdateSupplyModal(props: IProps) {
//     const { showModal, setShowModal, entity, setEntity, loadPage } = props;
//     const deviceClient: DeviceClient = useSelector(getDeviceClient);
//     const { t } = useTranslation();

//     async function requestAutoSupply() {
//         try {
//             await deviceClient.updateDeviceSettings(entity.id.toString(), {
//                 automaticPostForSale: entity.automaticPostForSale,
//                 defaultAskPrice: entity.defaultAskPrice * 100
//             });
//             setShowModal(false);
//             loadPage(1);
//             showNotification(t('device.feedback.supplyUpdatedSuccess'), NotificationType.Success);
//         } catch (error) {
//             showNotification(t('device.feedback.supplyUpdateError'), NotificationType.Error);
//         }
//     }

//     return (
//         <Dialog open={showModal}>
//             <DialogTitle>{t('device.actions.updateSupply')}</DialogTitle>
//             <DialogContent>
//                 <TextField
//                     label={t('device.properties.type')}
//                     value={entity?.deviceType}
//                     className="mt-4"
//                     disabled={true}
//                     fullWidth
//                 />

//                 <TextField
//                     label={t('device.properties.facility')}
//                     value={entity?.facilityName}
//                     className="mt-4"
//                     disabled={true}
//                     fullWidth
//                 />

//                 <TextField
//                     label={t('device.properties.price')}
//                     value={entity?.defaultAskPrice}
//                     className="mt-4"
//                     type="number"
//                     onChange={(e) =>
//                         setEntity({
//                             ...entity,
//                             defaultAskPrice: Number(e.target.value)
//                         })
//                     }
//                     fullWidth
//                 />

//                 <TextField
//                     label={t('device.properties.status')}
//                     value={entity?.automaticPostForSale ? KeyStatus[1] : KeyStatus[2]}
//                     className="mt-4"
//                     fullWidth
//                     onChange={(e) =>
//                         setEntity({
//                             ...entity,
//                             automaticPostForSale: e.target.value !== KeyStatus[2]
//                         })
//                     }
//                     select
//                 >
//                     <MenuItem value={KeyStatus[1]}>{t('device.properties.active')}</MenuItem>
//                     <MenuItem value={KeyStatus[2]}>{t('device.properties.paused')}</MenuItem>
//                 </TextField>
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={() => setShowModal(false)} color="secondary">
//                     {t('device.actions.cancel')}
//                 </Button>
//                 <Button onClick={requestAutoSupply} color="primary">
//                     {t('device.actions.update')}
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     );
// }
