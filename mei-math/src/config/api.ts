// API Base URL configuration
// In production (Vercel), use the backend URL from environment variable
// In development, use proxy (empty string means same origin, proxy will handle it)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

console.log("🌍 Environment:", import.meta.env.MODE);
console.log("🔧 PROD mode:", import.meta.env.PROD);
console.log("🔗 API_BASE_URL:", API_BASE_URL);

// Helper function to build API URLs
export const buildApiUrl = (path: string): string => {
  // If no base URL configured, use relative path (for development proxy or same-origin)
  if (!API_BASE_URL || API_BASE_URL === "") {
    console.log("📍 Using relative path:", path);
    return path;
  }

  // Production mode - prepend base URL
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;
  console.log("🌐 Using full URL:", fullUrl);
  return fullUrl;
};

// Enhanced fetch wrapper with better error handling
export const apiFetch = async (path: string, options?: RequestInit) => {
  const url = buildApiUrl(path);
  console.log(`🌐 API Call: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    console.error(`❌ API Error: ${response.status} - ${url}`);
    throw new Error(`API request failed: ${response.status}`);
  }

  return response;
};
