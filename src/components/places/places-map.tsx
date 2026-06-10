import MapView, { Marker } from "react-native-maps";
import type { Region } from "react-native-maps";
import type { SpaceCoordinate } from "../../features/places";

type PlacesMapProps = {
  coordinates: SpaceCoordinate[];
  onMarkerPress: (placeName: string) => void;
};

// A sane fallback when there are no pins to fit — a wide, world-ish view
// centered near the prime meridian. Empty coordinates are guarded by the
// parent (a hint is shown), but the map must never crash if it renders.
const DEFAULT_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

// Padding multiplier on the span so pins aren't flush against the edges.
const SPAN_PADDING = 1.4;
// Minimum delta so a single pin (or tightly clustered pins) isn't zoomed
// in absurdly far.
const MIN_DELTA = 0.02;

function computeInitialRegion(coordinates: SpaceCoordinate[]): Region {
  if (coordinates.length === 0) return DEFAULT_REGION;

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;

  for (const c of coordinates) {
    if (c.latitude < minLat) minLat = c.latitude;
    if (c.latitude > maxLat) maxLat = c.latitude;
    if (c.longitude < minLng) minLng = c.longitude;
    if (c.longitude > maxLng) maxLng = c.longitude;
  }

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max((maxLat - minLat) * SPAN_PADDING, MIN_DELTA);
  const longitudeDelta = Math.max((maxLng - minLng) * SPAN_PADDING, MIN_DELTA);

  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

// This component is the provider-abstraction boundary: it is the only file that
// imports react-native-maps. Using the default provider, iOS renders Apple Maps
// (no key) and Android renders Google Maps (one client key, set in app.json).
export function PlacesMap({ coordinates, onMarkerPress }: PlacesMapProps) {
  const initialRegion = computeInitialRegion(coordinates);

  return (
    <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
      {coordinates.map((c) => (
        <Marker
          key={c.id}
          coordinate={{ latitude: c.latitude, longitude: c.longitude }}
          title={c.place_name ?? undefined}
          onPress={() => {
            if (c.place_name) onMarkerPress(c.place_name);
          }}
        />
      ))}
    </MapView>
  );
}
