// Utility to dynamically update CSS custom properties for client theme branding

export function applyClientTheme(client) {
  if (!client) {
    // Reset to defaults
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--primary-hover');
    document.documentElement.style.removeProperty('--primary-light');
    document.documentElement.style.removeProperty('--secondary');
    document.documentElement.style.removeProperty('--accent');
    return;
  }

  const primary = client.primary_color || '#7C3AED';
  const secondary = client.secondary_color || '#0EA5E9';
  const accent = client.accent_color || '#F59E0B';

  // Apply colors
  document.documentElement.style.setProperty('--primary', primary);
  document.documentElement.style.setProperty('--secondary', secondary);
  document.documentElement.style.setProperty('--accent', accent);

  // Generate translucent primary version for light backgrounds (10% opacity)
  document.documentElement.style.setProperty('--primary-light', `${primary}1a`);

  // Generate hover color (slightly darker primary)
  const hoverColor = adjustColorBrightness(primary, -15);
  document.documentElement.style.setProperty('--primary-hover', hoverColor);
}

// Adjust hexadecimal color brightness
function adjustColorBrightness(hex, percent) {
  // Strip '#' if present
  let cleanHex = hex.replace(/^\s*#|\s*$/g, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.replace(/(.)/g, '$1$1');
  }

  let R = parseInt(cleanHex.substring(0, 2), 16);
  let G = parseInt(cleanHex.substring(2, 4), 16);
  let B = parseInt(cleanHex.substring(4, 6), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = Math.min(255, Math.max(0, R));
  G = Math.min(255, Math.max(0, G));
  B = Math.min(255, Math.max(0, B));

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}
