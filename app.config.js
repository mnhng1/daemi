// Dynamic Expo config. Extends the static app.json so the Android Google Maps
// key (a client-side, bundle-embedded key restricted by package + SHA-1) is
// injected from the environment at build time and never committed to the repo.
// iOS uses Apple Maps (default react-native-maps provider) and needs no key.
//
// Set ANDROID_MAPS_API_KEY in the build environment (e.g. EAS secret or local
// shell) before `npx expo run:android` / a release build. When unset, the map
// renders blank on Android but the Places list (the source of truth) is
// unaffected — the map is an additive lens.
module.exports = ({ config }) => {
  const androidMapsKey = process.env.ANDROID_MAPS_API_KEY;
  if (androidMapsKey && Array.isArray(config.plugins)) {
    config.plugins = config.plugins.map((plugin) =>
      Array.isArray(plugin) && plugin[0] === "react-native-maps"
        ? [
            "react-native-maps",
            { ...(plugin[1] ?? {}), androidGoogleMapsApiKey: androidMapsKey },
          ]
        : plugin,
    );
  }
  return config;
};
