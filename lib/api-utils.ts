/**
 * Utility functions for API requests
 */

/**
 * Safely parse JSON response text
 * @param responseText - The response text to parse
 * @param fallback - Fallback value if parsing fails or text is empty
 * @returns Parsed JSON or fallback value
 */
export const safeParseJSON = <T>(responseText: string, fallback: T): T => {
  if (!responseText) return fallback;
  
  try {
    return JSON.parse(responseText) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return fallback;
  }
};

/**
 * Fetch with retry logic for handling rate limiting and transient errors
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in ms between retries
 * @returns Promise resolving to the fetch response
 */
export const fetchWithRetry = async (
  url: string, 
  options: RequestInit, 
  maxRetries = 3, 
  baseDelay = 1000
): Promise<Response> => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        // Get retry-after header or use exponential backoff
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error(`Failed after ${maxRetries} attempts`);
};

/**
 * Extract error message from API response
 * @param response - The fetch response object
 * @param defaultMessage - Default error message
 * @returns Promise resolving to error message string
 */
export const extractErrorMessage = async (
  response: Response, 
  defaultMessage = "An error occurred"
): Promise<string> => {
  try {
    const responseText = await response.text();
    if (!responseText) return response.statusText || defaultMessage;
    
    const errorData = safeParseJSON(responseText, {});
    return errorData.detail || errorData.error || errorData.message || response.statusText || defaultMessage;
  } catch (e) {
    return response.statusText || defaultMessage;
  }
};