export type SpacePlace = { place_name: string; memory_count: number };

export type PlaceSuggestion = { placeId: string; description: string };

export type ResolvedPlace = {
  place_name: string;
  latitude: number | null;
  longitude: number | null;
};
