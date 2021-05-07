export const getDeviceAgeInYears = (operationalSince: number) => {
  const registerDate = new Date(operationalSince * 1000);
  const nowDate = new Date();
  return nowDate.getFullYear() - registerDate.getFullYear();
};
