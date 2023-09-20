export const frmDataToString = (frmData: FormDataEntryValue | null, defaultValue = "") => {
  const retVal = !!frmData ? frmData.toString() : defaultValue;
  return retVal;
};

export const frmDataToFloat = (frmData: FormDataEntryValue | null, defaultValue = 0.0): number => {
  const string = !!frmData ? frmData.toString().replace(/[^\d.-]/g, "") : null;
  const retVal = !!string ? parseFloat(string) : defaultValue;
  return retVal;
};

export const frmDataToInt = (frmData: FormDataEntryValue | null, defaultValue = 0): number => {
  const string = !!frmData ? frmData.toString().replace(/[^\d.-]/g, "") : null;
  const retVal = !!string ? parseInt(string) : defaultValue;
  return retVal;
};
