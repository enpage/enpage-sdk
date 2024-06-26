import { EnpageTemplateConfig } from "@enpage/types/config";
import { PageContext } from "@enpage/types/context";
import { providersSamples } from "./sample";

/**
 * If no datasources or attributes are defined in the config, this function will return void.
 * If a env variable is missing, it will log an error and return false.
 * If all is OK, it will fetch the context from the Enpage API and return it.
 */
export async function fetchContext(cfg: EnpageTemplateConfig) {
  const pageId = process.env.ENPAGE_PAGE_ID;
  const apiToken = process.env.ENPAGE_API_TOKEN;
  let apiBaseUrl = process.env.ENPAGE_BASE_URL;
  // Abort if there is no datasources or attributes
  if (
    (!cfg.datasources || !Object.keys(cfg.datasources).length) &&
    (!cfg.attributes || !Object.keys(cfg.attributes).length)
  ) {
    console.error("No datasources or attributes found in config. Skipping context fetch.");
    return;
  }
  // Abort if there is no pageId
  if (!pageId) {
    console.error("ENPAGE_PAGE_ID is empty. Skipping context fetch.");
    return false;
  }
  // Abort if there is no apiToken
  if (!apiToken) {
    console.error("ENPAGE_API_TOKEN is empty. Skipping context fetch.");
    return false;
  }
  // Abort if there is no apiHost
  if (!apiBaseUrl) {
    apiBaseUrl = "http://local.enpage.co:8080/api/v1/pages";
    console.error("ENPAGE_API_HOST is empty. Skipping context fetch.");
    return false;
  }

  // fetch context
  const url = `${apiBaseUrl}/pages/${pageId}/context`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
  });

  const context = (await response.json()) as PageContext<typeof cfg.datasources, typeof cfg.attributes>;

  return context;
}

export function createFakeContext(cfg: EnpageTemplateConfig) {
  let data;
  let attributes;

  if (cfg.datasources) {
    data = {} as Record<string, unknown>;
    for (const key in cfg.datasources) {
      const provider = cfg.datasources[key].provider;
      if (typeof provider === "string") {
        data[key] = providersSamples[provider];
      } else if ("sampleData" in cfg.datasources[key] && cfg.datasources[key].sampleData) {
        data[key] = cfg.datasources[key].sampleData;
      }
    }
  }

  if (cfg.attributes) {
    attributes = {} as Record<string, unknown>;
    for (const key in cfg.attributes) {
      attributes[key] = cfg.attributes[key].value;
    }
  }

  const page = {
    title: "Demo Page",
    metaTags: [
      {
        name: "description",
        content: "Demo Page Description",
      },
      {
        name: "keywords",
        content: "demo, page",
      },
    ],
  };

  return { data, attributes, page } as PageContext<typeof cfg.datasources, typeof cfg.attributes>;
}
