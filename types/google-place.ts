/**
 * Normalized address after a Google Place Details (New) selection.
 * Fields align with CreateAddressDto for signup / profile APIs.
 */
export type GoogleResolvedAddress = {
  googlePlaceId: string;
  fullAddress: string;
  lat: number;
  lng: number;
  street: string;
  number: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};
