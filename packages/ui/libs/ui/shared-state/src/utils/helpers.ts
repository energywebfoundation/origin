export const getFromLocalStorage = (key: string): (() => any) => {
  return () => JSON.parse(localStorage.getItem(key));
};

export const removeFromLocalStorage = (key: string): (() => void) => {
  return () => localStorage.removeItem(key);
};
