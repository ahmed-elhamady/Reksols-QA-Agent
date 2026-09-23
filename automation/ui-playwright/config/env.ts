function readConfiguredBaseUrl(): string | undefined {
  const value =
    process.env.ODYX_BASE_URL?.trim() || process.env.BASE_URL?.trim();

  return value || undefined;
}

export function optionalBaseURL(): string | undefined {
  return readConfiguredBaseUrl();
}

export function getBaseURL(): string {
  const value = readConfiguredBaseUrl();

  if (!value) {
    throw new Error(
      'Environment URL is missing. Set ODYX_BASE_URL or BASE_URL from the Environment Artifact. No fallback URL is defined.',
    );
  }

  return value;
}

export const env = {
  get baseURL(): string {
    return getBaseURL();
  },
};
