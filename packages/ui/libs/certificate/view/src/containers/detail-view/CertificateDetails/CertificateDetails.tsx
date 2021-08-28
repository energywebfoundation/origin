import { DetailedCertificate } from '@energyweb/origin-ui-certificate-data';
import { SmallTitleWithText } from '@energyweb/origin-ui-core';
import { formatDate } from '@energyweb/origin-ui-utils';
import { CircularProgress, Grid, Paper, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { StyledTitleAndText } from '../StyledTitleAndText';
import { useCertificateDetailsEffects } from './CertificateDetails.effects';
import { useStyles } from './CertificateDetails.styles';

export interface CertificateDetailsProps {
  certificate: DetailedCertificate;
}

export const CertificateDetails: FC<CertificateDetailsProps> = ({
  certificate,
}) => {
  const classes = useStyles();
  const {
    certificateId,
    certifiedEnergy,
    claimed,
    creationDate,
    generationStartDate,
    generationEndDate,
    isLoading,
    eventsData,
    blockhainTransactionsTitle,
    claimedEnergy,
    remainingEnergy,
    claimBeneficiaries,
  } = useCertificateDetailsEffects(certificate);
  const blockExplorerUrl = (window as any).config.BLOCKCHAIN_EXPLORER_URL;

  if (isLoading) return <CircularProgress />;

  return (
    <>
      <Paper className={classes.paper}>
        <Grid container>
          <Grid item md={4} xs={12}>
            <StyledTitleAndText {...certificateId} />
            <StyledTitleAndText {...certifiedEnergy} />
            {certificate.blockchainPart.isClaimed && (
              <StyledTitleAndText {...claimedEnergy} />
            )}
          </Grid>
          <Grid item md={4} xs={12}>
            <StyledTitleAndText {...claimed} />
            <StyledTitleAndText {...creationDate} />
            {certificate.blockchainPart.isClaimed && (
              <StyledTitleAndText {...remainingEnergy} />
            )}
          </Grid>
          <Grid item md={4} xs={12}>
            <StyledTitleAndText {...generationStartDate} />
            <StyledTitleAndText {...generationEndDate} />
            {certificate.blockchainPart.isClaimed && (
              <div className={classes.blockItem}>
                <Typography color="textSecondary" margin="normal">
                  {claimBeneficiaries?.title}
                </Typography>
                <ol className={classes.beneficiariesList}>
                  {claimBeneficiaries?.listItems?.map((item) => (
                    <li key={item}>
                      <Typography>{item}</Typography>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.paper}>
        <Typography
          className={classes.eventsItem}
          variant="h4"
          align="center"
          margin="normal"
        >
          {blockhainTransactionsTitle}
        </Typography>
        <div>
          {eventsData.map((event) => (
            <SmallTitleWithText
              wrapperProps={{ className: classes.eventsItem }}
              key={event.label + event.description + event.txHash}
              titleElement={
                <Typography color="textSecondary">
                  {formatDate(event.timestamp)}
                  {event.txHash && ' - '}
                  {event.txHash && (
                    <a
                      className={classes.link}
                      href={`${blockExplorerUrl}/tx/${event.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {event.txHash}
                    </a>
                  )}
                </Typography>
              }
              text={`${event.label} - ${event.description}`}
            />
          ))}
        </div>
      </Paper>
    </>
  );
};
