export const getDeviceAgeInYears = (commissioningDate: string) => {
  const registerDate = new Date(commissioningDate);
  const nowDate = new Date();
  return nowDate.getFullYear() - registerDate.getFullYear();
};
