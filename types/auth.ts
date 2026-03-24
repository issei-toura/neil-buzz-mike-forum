/**
 * Auth-related types aligned with Forum OpenAPI (api-json) schemas.
 */

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserReadDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  telephone: string;
}

export interface LoginSucceededDto {
  accessToken: string;
  user: UserReadDto;
}

export interface CreateAddressDto {
  street: string;
  number: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fullAddress?: string;
  streetName?: string;
  streetNumber?: string;
  googlePlaceId?: string;
  lng?: number;
  lat?: number;
  suburb?: string;
  postcode?: string;
}

export interface UserCreateDto {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  address: CreateAddressDto;
  password: string;
  confirmPassword: string;
  avatar?: string;
}
