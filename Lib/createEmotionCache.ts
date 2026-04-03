import createCache from "@emotion/cache";

// Use a stable cache key and prepend to maintain consistent stylesheet order.
export default function createEmotionCache() {
  return createCache({ key: "mui", prepend: true });
}
