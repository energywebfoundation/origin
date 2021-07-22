import { OrganizationAdded } from '@energyweb/origin-ui-assets';
import {
  GenericModal,
  ModalTextBulletList,
  ModalTextContent,
} from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { useRoleChangedEffects } from './RoleChanged.effects';
import { useStyles } from './RoleChanged.styles';

export const RoleChanged: FC = () => {
  const { open, title, subtitle, roleDescriptions, buttons } =
    useRoleChangedEffects();
  const classes = useStyles();

  return (
    <GenericModal
      open={open}
      icon={<OrganizationAdded />}
      title={title}
      dialogProps={{ maxWidth: 'sm' }}
      customContent={
        <div>
          <ModalTextContent
            textProps={{ gutterBottom: true, className: classes.headings }}
            text={subtitle}
          />
          {roleDescriptions.map((role) => (
            <ModalTextBulletList
              key={role.title}
              heading={role.title}
              items={role.actions}
              headingProps={{ className: classes.headings }}
              listItemIconProps={{ className: classes.listItemIcon }}
              bulletIconProps={{ className: classes.bulletIcon }}
            />
          ))}
        </div>
      }
      buttons={buttons}
    />
  );
};
