import { createContext, useContext } from 'react';

const CampusContext = createContext(undefined);

export const CAMPUS_NAME = 'Institute of Advanced Research, Gandhinagar';
export const CAMPUS_SHORT_NAME = 'IAR Gandhinagar';

export function CampusProvider({ children }) {
  return (
    <CampusContext.Provider
      value={{
        selectedCampus: CAMPUS_NAME,
        campusName: CAMPUS_NAME,
        campusShortName: CAMPUS_SHORT_NAME,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampus must be used within a CampusProvider');
  return ctx;
}
