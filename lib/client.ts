import { createClient } from "microcms-js-sdk";

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});

(async () => {
  try {
    const data = await client.get({ endpoint: "blogs" });
    console.log("microCMS response:", data);
  } catch (err) {
    console.error("microCMS fetch error:", err);
  }
})();