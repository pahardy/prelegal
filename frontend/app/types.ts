export interface NdaData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: "expires" | "continuous";
  mndaTermYears: number;
  confidentialityTermType: "years" | "perpetuity";
  confidentialityTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  party1Company: string;
  party1Name: string;
  party1Title: string;
  party1Address: string;
  party2Company: string;
  party2Name: string;
  party2Title: string;
  party2Address: string;
}
