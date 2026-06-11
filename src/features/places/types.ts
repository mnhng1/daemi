export type SpacePlace = { place_name: string; memory_count: number };

export type PlaceSuggestion = { placeId: string; description: string };

export type ResolvedPlace = {
  place_name: string;
  latitude: number | null;
  longitude: number | null;
};

export type SpaceCoordinate = {
  id: string;
  place_name: string | null;
  latitude: number;
  longitude: number;
};
