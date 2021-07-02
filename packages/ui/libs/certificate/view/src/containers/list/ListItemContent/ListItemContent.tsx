import { Button, Typography } from '@material-ui/core';
import React, { FC } from 'react';

export const ListItemContent: FC = () => {
  return (
    <div>
      <div>icon</div>
      <div>
        <div>
          <Typography>Solar</Typography>
          <Typography>1000 MWh</Typography>
        </div>
        <div>
          <Typography>Generation Time Frame</Typography>
          <Typography>Dec 1, 2020 - Dec 31, 2020</Typography>
        </div>
      </div>
      <Button variant="outlined" color="primary">
        View
      </Button>
    </div>
  );
};
