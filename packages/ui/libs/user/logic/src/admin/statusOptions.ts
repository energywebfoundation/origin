import {
  KYCStatus,
  UserStatus,
} from '@energyweb/origin-backend-react-query-client';

export const STATUS_OPTIONS = Object.keys(UserStatus).map((key) => ({
  value: key,
  label: key,
}));

export const KYC_STATUS_OPTIONS = Object.keys(KYCStatus).map((key) => ({
  value: key,
  label: key,
}));
