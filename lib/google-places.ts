import type { GoogleResolvedAddress } from '@/types/google-place';

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

type AutocompleteText = { text?: string };

type PlacePrediction = {
  placeId?: string;
  text?: AutocompleteText;
};

type AutocompleteSuggestion = {
  placePrediction?: PlacePrediction;
};

type AutocompleteResponse = {
  suggestions?: AutocompleteSuggestion[];
};

type AddressComponentV1 = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type PlaceDetailResponse = {
  id?: string;
  formattedAddress?: string;
  addressComponents?: AddressComponentV1[];
  location?: { latitude?: number; longitude?: number };
};

export type PlaceSuggestion = {
  placeId: string;
  description: string;
};

function getApiKey(): string {
  return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
}

function firstMatchingLongText(
  components: AddressComponentV1[],
  typePriority: string[]
): string {
  for (const type of typePriority) {
    const found = components.find((c) => c.types?.includes(type));
    if (found?.longText) return found.longText;
  }
  return '';
}

function parseResolvedFromPlace(place: PlaceDetailResponse): GoogleResolvedAddress | null {
  const placeId = place.id?.trim() ?? '';
  const fullAddress = place.formattedAddress?.trim() ?? '';
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (!placeId || lat === undefined || lng === undefined) return null;

  const components = place.addressComponents ?? [];
  const number = firstMatchingLongText(components, ['street_number']);
  const route = firstMatchingLongText(components, ['route']);
  const street = route;
  const city = firstMatchingLongText(components, [
    'locality',
    'postal_town',
    'administrative_area_level_2',
    'sublocality_level_1',
    'neighborhood',
  ]);
  const state = firstMatchingLongText(components, ['administrative_area_level_1']);
  const postalCode = firstMatchingLongText(components, ['postal_code']);
  const country = firstMatchingLongText(components, ['country']);

  return {
    googlePlaceId: placeId,
    fullAddress: fullAddress || [number, route, city, state, postalCode, country].filter(Boolean).join(', '),
    lat,
    lng,
    street,
    number,
    city,
    state,
    postalCode,
    country,
  };
}

export async function fetchPlaceSuggestions(
  input: string,
  signal?: AbortSignal,
  languageCode = 'en'
): Promise<PlaceSuggestion[]> {
  const key = getApiKey();
  const q = input.trim();
  if (!key || q.length < 2) return [];

  const res = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
    },
    body: JSON.stringify({ input: q, languageCode }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Places Autocomplete failed: ${res.status} ${errText}`);
  }

  const data = (await res.json()) as AutocompleteResponse;
  const raw = data.suggestions ?? [];
  const out: PlaceSuggestion[] = [];
  for (const s of raw) {
    const p = s.placePrediction;
    const placeId = p?.placeId?.trim();
    const description = p?.text?.text?.trim();
    if (placeId && description) out.push({ placeId, description });
  }
  return out;
}

export async function fetchPlaceDetails(placeId: string, signal?: AbortSignal): Promise<GoogleResolvedAddress | null> {
  const key = getApiKey();
  const id = placeId.trim();
  if (!key || !id) return null;

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'GET',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'id,formattedAddress,addressComponents,location',
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Place Details failed: ${res.status} ${errText}`);
  }

  const place = (await res.json()) as PlaceDetailResponse;
  return parseResolvedFromPlace(place);
}
