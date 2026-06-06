const fs = require("fs");
const path = require("path");
const { fetchFundUpdateData } = require("./scripts/lib/fetch-fund-update-data");

module.exports = function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(require("@11ty/eleventy-plugin-syntaxhighlight"));

  // Passthrough copy - copy existing files as-is
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("favicons");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy(".nojekyll");
  
  // Watch targets
  eleventyConfig.addWatchTarget("css/tailwind.css");

  function isBlogPost(item) {
    return (
      item.inputPath &&
      item.inputPath.includes("_blog/_posts/") &&
      item.inputPath.endsWith(".md")
    );
  }

  function isFundUpdate(item) {
    return (
      item.data.layout === "fund-update-post.njk" ||
      (Array.isArray(item.data.tags) && item.data.tags.includes("fund-update"))
    );
  }

  function sortByDateDesc(items) {
    return items.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  }

  function assertFundUpdateNotBlogArticle(item) {
    const url = String(item.url || item.data?.permalink || "");
    const looksLikeFundUpdate =
      isFundUpdate(item) ||
      item.data?.fundUpdateSnapshot ||
      url.includes("messy-fund-update");
    if (!looksLikeFundUpdate) return;

    if (url.startsWith("/blog/")) {
      throw new Error(
        `[fundUpdate] Fund updates must use /updates/ permalinks, not /blog/: ${item.inputPath}`
      );
    }
    if (item.data?.layout === "post.njk") {
      throw new Error(
        `[fundUpdate] Fund updates must use layout fund-update-post.njk, not post.njk: ${item.inputPath}`
      );
    }
  }

  // Collections
  eleventyConfig.addCollection("blog", function (collectionApi) {
    const posts = collectionApi.getAll().filter(isBlogPost);
    const articles = posts.filter(function (item) {
      assertFundUpdateNotBlogArticle(item);
      return !isFundUpdate(item);
    });

    const leaked = posts.filter(function (item) {
      return isFundUpdate(item);
    });
    leaked.forEach(assertFundUpdateNotBlogArticle);

    return sortByDateDesc(articles);
  });

  eleventyConfig.addCollection("fundUpdates", function (collectionApi) {
    const weeks = collectionApi
      .getAll()
      .filter(function (item) {
        return isBlogPost(item) && isFundUpdate(item);
      });

    weeks.forEach(assertFundUpdateNotBlogArticle);

    return sortByDateDesc(weeks);
  });

  // Markdown configuration
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  
  let md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  }).use(markdownItAnchor);

  eleventyConfig.setLibrary("md", md);

  // Filters
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    const date = new Date(dateObj);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    const date = new Date(dateObj);
    return date.toISOString().split("T")[0];
  });

  // Extract first paragraph as excerpt
  eleventyConfig.addFilter("excerpt", (text) => {
    const match = text.match(/<p>(.+?)<\/p>/);
    if (match && match.length > 2) {
      return match[1].substring(0, 150) + "...";
    }
    return "";
  });

  // Slugify filter for URLs
  eleventyConfig.addFilter("slugify", (str) => {
    if (!str || typeof str !== "string") {
      return "";
    }
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  });

  // Date formatting filter for URLs (YYYY/MM format)
  eleventyConfig.addFilter("dateFilter", (dateObj) => {
    const date = new Date(dateObj);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}/${month}`;
  });

  // Frozen snapshot for archived Fund / Signal blog posts
  eleventyConfig.addGlobalData("eleventyComputed", {
    fu: async (data) => {
      const snapId = data.fundUpdateSnapshot;
      if (!snapId) return null;

      const snapPath = path.join(
        __dirname,
        "_blog",
        "_snapshots",
        `${snapId}-messy-fund-update.snapshot.json`
      );
      if (fs.existsSync(snapPath)) {
        return JSON.parse(fs.readFileSync(snapPath, "utf8"));
      }

      console.warn(`[fundUpdate] Snapshot missing: ${snapPath} — fetching live fallback`);
      return fetchFundUpdateData({
        useCli: false,
        snapshotDate: new Date(`${snapId}T12:00:00Z`).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });
    },
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};

