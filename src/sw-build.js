const workboxBuild = require("workbox-build");
// NOTE: This should be run *AFTER* all your assets are built
const buildSW = () => {
  // This will return a Promise
  return workboxBuild
    .injectManifest({
      swSrc: "src/sw-custom.js", // custom sw rule

      swDest: "build/sw.js", // sw output file (auto-generated

      globDirectory: "build",

      globPatterns: ["**/*.{js,css,html,png,svg}"],

      maximumFileSizeToCacheInBytes: 5 * 1024 * 102,
    })
    .then(({ count, size, warnings }) => {
      warnings.forEach(console.warn);
      console.info(`${count} files will be precached,
                  totaling ${size / (1024 * 1024)} MBs.`);
    });
};
buildSW();
