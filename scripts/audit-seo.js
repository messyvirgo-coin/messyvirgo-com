const fs = require("fs");

const SITE_URL = "https://www.messyvirgo.com";
const MAX_TITLE_LENGTH = 70;
const MAX_DESCRIPTION_LENGTH = 170;

const INTERNAL_INPUT_PATTERNS = [
  /^\.\/\.(claude|cursor|github)\//,
  /^\.\/openspec\//,
  /^\.\/(AGENTS|BRAND|CLAUDE|CODE_OF_CONDUCT|CONTRIBUTING|GOVERNANCE|NOTICE|REVIEWING_REPO_DOCS|SUPPORT)\.md$/,
];

const REDIRECT_INPUT_PATTERN = /^\.\/legacy-/;

function usage() {
  console.error("Usage: node scripts/audit-seo.js <eleventy-json-output>");
  process.exit(2);
}

function parseEleventyJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const start = raw.indexOf("[\n  {");
  if (start === -1) {
    throw new Error(`Could not find Eleventy JSON array in ${filePath}`);
  }
  return JSON.parse(raw.slice(start));
}

function normalizeText(value) {
  return (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(tagName, html) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? normalizeText(match[1]) : "";
}

function getMeta(name, html) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const byName = new RegExp(
    `<meta\\s+[^>]*name=["']${escaped}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const byProperty = new RegExp(
    `<meta\\s+[^>]*property=["']${escaped}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  const match = html.match(byName) || html.match(byProperty);
  return match ? normalizeText(match[1]) : "";
}

function getCanonical(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  return match ? match[1].trim() : "";
}

function getJsonLdTypes(html) {
  return [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((match) => {
      try {
        const parsed = JSON.parse(match[1].trim());
        const nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] || [parsed];
        return nodes.map((node) => node["@type"]).filter(Boolean);
      } catch (_error) {
        return ["INVALID_JSON_LD"];
      }
    });
}

function isInternalPage(page) {
  return INTERNAL_INPUT_PATTERNS.some((pattern) => pattern.test(page.inputPath || ""));
}

function isRedirectPage(page) {
  return REDIRECT_INPUT_PATTERN.test(page.inputPath || "");
}

function auditPage(page) {
  const html = page.content || "";
  const title = getTag("title", html);
  const description = getMeta("description", html);
  const robots = getMeta("robots", html);
  const canonical = getCanonical(html);
  const h1Count = [...html.matchAll(/<h1\b[^>]*>/gi)].length;
  const jsonLdTypes = getJsonLdTypes(html);
  const issues = [];

  if (isInternalPage(page)) {
    issues.push("internal source file is rendered publicly");
    return issues;
  }

  if (isRedirectPage(page)) {
    if (!canonical.startsWith(`${SITE_URL}/`)) {
      issues.push("redirect page missing absolute canonical");
    }
    if (!robots.toLowerCase().includes("noindex")) {
      issues.push("redirect page must be noindex");
    }
    return issues;
  }

  if (!title) issues.push("missing title");
  if (title.length > MAX_TITLE_LENGTH) {
    issues.push(`title too long (${title.length} > ${MAX_TITLE_LENGTH})`);
  }
  if (!description) issues.push("missing meta description");
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    issues.push(`meta description too long (${description.length} > ${MAX_DESCRIPTION_LENGTH})`);
  }
  if (!canonical.startsWith(`${SITE_URL}/`)) {
    issues.push("missing absolute canonical");
  }
  if (robots !== "index, follow") {
    issues.push(`unexpected robots value: ${robots || "(missing)"}`);
  }
  if (h1Count !== 1) {
    issues.push(`expected exactly one h1, found ${h1Count}`);
  }
  if (jsonLdTypes.length === 0) {
    issues.push("missing JSON-LD");
  }
  if (jsonLdTypes.includes("INVALID_JSON_LD")) {
    issues.push("invalid JSON-LD");
  }

  return issues;
}

function auditSitemap(pages) {
  const sitemap = pages.find((page) => page.url === "/sitemap.xml");
  if (!sitemap) {
    return ["missing sitemap.xml"];
  }

  const sitemapLocations = new Set(
    [...(sitemap.content || "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())
  );
  const issues = [];

  for (const page of pages) {
    if (!(page.outputPath || "").endsWith(".html")) continue;
    if (isInternalPage(page) || isRedirectPage(page)) continue;

    const expectedLocation = `${SITE_URL}${page.url}`;
    if (!sitemapLocations.has(expectedLocation)) {
      issues.push(`sitemap missing ${expectedLocation}`);
    }
  }

  return issues;
}

function auditAssociationRename(pages) {
  const issues = [];
  const htmlPages = pages.filter((page) => (page.outputPath || "").endsWith(".html"));
  const associationPage = htmlPages.find((page) => page.url === "/association.html");
  const governancePage = htmlPages.find((page) => page.url === "/governance.html");

  if (!associationPage) {
    issues.push("missing canonical association page at /association.html");
  }
  if (!governancePage || !isRedirectPage(governancePage)) {
    issues.push("/governance.html must render only as a legacy noindex redirect");
  }

  for (const page of htmlPages) {
    if (isRedirectPage(page)) continue;
    if ((page.content || "").includes('href="/governance.html"')) {
      issues.push(`${page.url} links to legacy /governance.html`);
    }
  }

  return issues;
}

const [, , filePath] = process.argv;
if (!filePath) usage();

const pages = parseEleventyJson(filePath).filter((page) => (page.outputPath || "").endsWith(".html"));
const failures = [];

for (const page of pages) {
  const issues = auditPage(page);
  if (issues.length > 0) {
    failures.push({ url: page.url, inputPath: page.inputPath, issues });
  }
}

const sitemapIssues = auditSitemap(parseEleventyJson(filePath));
if (sitemapIssues.length > 0) {
  failures.push({ url: "/sitemap.xml", inputPath: "sitemap.xml.njk", issues: sitemapIssues });
}

const associationIssues = auditAssociationRename(parseEleventyJson(filePath));
if (associationIssues.length > 0) {
  failures.push({ url: "/association.html", inputPath: "association rename", issues: associationIssues });
}

if (failures.length > 0) {
  console.error(`SEO audit failed for ${failures.length} page(s):`);
  for (const failure of failures) {
    console.error(`\n${failure.url} (${failure.inputPath})`);
    for (const issue of failure.issues) {
      console.error(`  - ${issue}`);
    }
  }
  process.exit(1);
}

console.log(`SEO audit passed for ${pages.length} rendered HTML page(s).`);
