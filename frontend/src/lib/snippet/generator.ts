/**
 * @module lib/snippet/generator
 * Helper functions for generating and previewing embed snippets
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://openrole.co.uk';

/**
 * Generate the HTML snippet code for a given slug
 */
export function generateSnippetCode(slug: string): string {
  return `<script src="${APP_URL}/api/snippet/${slug}" async></script>`;
}

/**
 * Platform-specific installation instructions
 */
export interface PlatformGuide {
  name: string;
  icon: string;
  steps: string[];
}

export const platformGuides: PlatformGuide[] = [
  {
    name: 'WordPress',
    icon: '📝',
    steps: [
      'Go to Appearance → Theme Editor',
      'Find header.php in the template files',
      'Paste the snippet before the closing </head> tag',
      'Alternatively, install "Insert Headers and Footers" plugin',
      'Paste in the "Scripts in Header" section',
    ],
  },
  {
    name: 'Webflow',
    icon: '🎨',
    steps: [
      'Open your Webflow project',
      'Go to Project Settings → Custom Code',
      'Paste the snippet in the "Head Code" section',
      'Click Save and publish your site',
    ],
  },
  {
    name: 'Greenhouse',
    icon: '🌱',
    steps: [
      'Log in to your Greenhouse account',
      'Go to Configure → Career Page',
      'Scroll to "Custom CSS/JS" section',
      'Paste the snippet in the JavaScript field',
      'Click Save',
    ],
  },
  {
    name: 'Squarespace',
    icon: '⬛',
    steps: [
      'Open your Squarespace dashboard',
      'Go to Settings → Advanced → Code Injection',
      'Paste the snippet in the "Header" section',
      'Click Save',
    ],
  },
  {
    name: 'Shopify',
    icon: '🛍️',
    steps: [
      'Go to Online Store → Themes',
      'Click Actions → Edit Code',
      'Find theme.liquid in Layout',
      'Paste the snippet before </head>',
      'Click Save',
    ],
  },
  {
    name: 'Generic HTML',
    icon: '🌐',
    steps: [
      'Open your careers page HTML file',
      'Locate the closing </head> tag',
      'Paste the snippet just before it',
      'Deploy the updated file to your server',
    ],
  },
];

/**
 * Generate the OpenRole profile URL for a given slug
 */
export function generateProfileUrl(slug: string): string {
  return `${APP_URL}/company/${slug}`;
}

/**
 * Verification steps for checking installation
 */
export const verificationSteps = [
  'Open your careers page in Google Chrome',
  'Right-click and select "Inspect" to open DevTools',
  'Go to the "Elements" tab',
  'Press Ctrl+F (Cmd+F on Mac) to search',
  'Search for "application/ld+json"',
  'Verify your company data appears in the schema',
  'Check the "employer-data-source" and "employer-facts-url" meta tags are present',
  'The employer-facts-url should point to your OpenRole profile',
];
