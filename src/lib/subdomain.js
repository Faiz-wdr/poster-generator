/**
 * Utility helper to extract subdomains and identify client tenant slugs from window.location.hostname
 */
export function getSubdomainInfo(hostname = window.location.hostname) {
  // Normalize hostname
  const host = hostname.toLowerCase().trim();

  // Localhost, IP addresses, or root dev hosts (e.g. 127.0.0.1, localhost)
  if (host === 'localhost' || host === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    return { type: 'root', slug: null };
  }

  const parts = host.split('.');
  
  // Single word hostname or standard apex domain (e.g. yourdomain.com -> 2 parts)
  if (parts.length <= 2) {
    return { type: 'root', slug: null };
  }

  // Extract subdomain (first segment of hostname)
  const subdomain = parts[0];

  // Reserved subdomains
  if (subdomain === 'www' || subdomain === 'app' || subdomain === 'landing') {
    return { type: 'root', slug: null };
  }

  if (subdomain === 'admin' || subdomain === 'sadmin' || subdomain === 'superadmin') {
    return { type: 'superadmin', slug: null };
  }

  // Valid client tenant slug
  return { type: 'client', slug: subdomain };
}
