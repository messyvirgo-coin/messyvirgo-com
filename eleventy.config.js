/**
 * Eleventy config
 *
 * Note: On Linux, Node's `fs.watch` uses inotify. If `fs.inotify.max_user_instances`
 * is low (common on some distros), Eleventy/Chokidar can fail with:
 *   EMFILE: too many open files, watch '...'
 *
 * Polling avoids inotify instances and is more reliable across environments.
 */
module.exports = function (eleventyConfig) {
  eleventyConfig.setChokidarConfig({
    usePolling: true,
    interval: 300,
    binaryInterval: 300,
  });

  // Avoid watching generated output and dependencies.
  eleventyConfig.watchIgnores.add("_site/**");
  eleventyConfig.watchIgnores.add("node_modules/**");
  eleventyConfig.watchIgnores.add(".git/**");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
  };
};

