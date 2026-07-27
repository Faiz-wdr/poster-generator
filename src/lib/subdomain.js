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

  // Check if platform hosting apex domain (e.g. vercel.app, netlify.app, onrender.com, github.io)
  const isPlatformDomain =
    host.endsWith('.vercel.app') ||
    host.endsWith('.netlify.app') ||
    host.endsWith('.onrender.com') ||
    host.endsWith('.github.io') ||
    host.endsWith('.pages.dev');

  const minPartsForSubdomain = isPlatformDomain ? 4 : 3;

  // Root / Apex Domain (e.g. yourdomain.com [2 parts] or app.vercel.app [3 parts])
  if (parts.length < minPartsForSubdomain) {
    return { type: 'root', slug: null };
  }

  // Check for exact root platform domains (e.g. fest.faizrahim.online)
  if (host === 'fest.faizrahim.online' || host === 'www.fest.faizrahim.online') {
    return { type: 'root', slug: null };
  }

  // Extract subdomain (first segment of hostname)
  const subdomain = parts[0];

  // Reserved subdomains pointing to main SaaS landing page
  if (subdomain === 'www' || subdomain === 'app' || subdomain === 'landing' || subdomain === 'fest') {
    return { type: 'root', slug: null };
  }

  if (subdomain === 'admin' || subdomain === 'sadmin' || subdomain === 'superadmin') {
    return { type: 'superadmin', slug: null };
  }

  // Valid client tenant slug
  return { type: 'client', slug: subdomain };
}
