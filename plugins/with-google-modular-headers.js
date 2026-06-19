const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * GoogleSignin's iOS SDK pulls in AppCheckCore (a Swift pod) which imports
 * GoogleUtilities and RecaptchaInterop. Those pods don't ship module maps, so
 * static linking fails with:
 *   "The Swift pod `AppCheckCore` depends upon `GoogleUtilities` and
 *    `RecaptchaInterop`, which do not define modules."
 *
 * The fix the error itself recommends: build those deps with modular headers.
 * The Expo SDK Podfile template doesn't consume `extraPods`, so we inject the
 * pod lines directly into the app target. Runs on every prebuild → durable.
 */
const POD_LINES = [
  "  pod 'GoogleUtilities', :modular_headers => true",
  "  pod 'RecaptchaInterop', :modular_headers => true",
];

module.exports = function withGoogleModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const podfilePath = path.join(
        cfg.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = fs.readFileSync(podfilePath, "utf8");

      if (contents.includes("pod 'GoogleUtilities', :modular_headers")) {
        return cfg; // already injected
      }

      // Insert right after `use_expo_modules!` inside the app target.
      const anchor = "use_expo_modules!";
      const idx = contents.indexOf(anchor);
      if (idx === -1) {
        throw new Error(
          "[with-google-modular-headers] could not find `use_expo_modules!` anchor in Podfile"
        );
      }
      const insertAt = contents.indexOf("\n", idx) + 1;
      contents =
        contents.slice(0, insertAt) +
        POD_LINES.join("\n") +
        "\n" +
        contents.slice(insertAt);

      fs.writeFileSync(podfilePath, contents);
      return cfg;
    },
  ]);
};
