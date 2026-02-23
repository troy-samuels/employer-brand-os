/**
 * @module lib/utils/company-names
 * Smart company name formatting and known-name overrides.
 *
 * The audit database stores names derived from domains, which often
 * lack proper casing (e.g. "Fdmgroup" instead of "FDM Group").
 * This utility fixes that.
 */

/* Known company name overrides — key is lowercase slug/name */
const KNOWN_NAMES: Record<string, string> = {
  // Tech
  "fdmgroup": "FDM Group",
  "edfenergy": "EDF Energy",
  "hsbc": "HSBC",
  "nhs": "NHS",
  "bpp": "BPP",
  "greeneking": "Greene King",
  "bae-systems": "BAE Systems",
  "bt-group": "BT Group",
  "pwc-uk": "PwC UK",
  "pwc": "PwC",
  "ey-uk": "EY UK",
  "ucl": "UCL",
  "bbcjobs": "BBC",
  "bbc": "BBC",
  "gsk": "GSK",
  "wpp": "WPP",
  "kpmg-uk": "KPMG UK",
  "asos": "ASOS",
  "bdo": "BDO",
  "diy": "B&Q",
  "ihg": "IHG",
  "ba": "British Airways",
  "bp": "BP",
  "ee": "EE",
  "lv": "LV=",
  "qa": "QA",
  "rb": "RB",
  "sc": "Standard Chartered",
  "ed": "University of Edinburgh",
  "ntu": "Nottingham Trent University",
  "ncl": "Newcastle University",
  "dwp": "DWP",
  "fco": "FCDO",
  "relx": "RELX",
  "omd": "OMD",
  "g4s": "G4S",
  "hp": "HP",

  // Known companies with multi-word names
  "legalandgeneral": "Legal & General",
  "legal-general": "Legal & General",
  "osborneclarke": "Osborne Clarke",
  "monzo": "Monzo",
  "reedglobal": "Reed Global",
  "lloyds-banking-group": "Lloyds Banking Group",
  "revolut": "Revolut",
  "washingtonfrank": "Washington Frank",
  "redcross": "British Red Cross",
  "leicspart": "Leicestershire Partnership NHS Trust",
  "compass-group": "Compass Group",
  "tescobank": "Tesco Bank",
  "mottmac": "Mott MacDonald",
  "britishgas": "British Gas",
  "darktrace": "Darktrace",
  "starling-bank": "Starling Bank",
  "deloitte-uk": "Deloitte UK",
  "accenture-uk": "Accenture UK",
  "capgemini-uk": "Capgemini UK",
  "checkout-com": "Checkout.com",
  "gocardless": "GoCardless",
  "virginmedia": "Virgin Media",
  "johnlewis": "John Lewis",
  "john-lewis-partnership": "John Lewis Partnership",
  "marksandspencer": "Marks & Spencer",
  "marks-and-spencer": "Marks & Spencer",
  "natwestgroup": "NatWest Group",
  "babcockinternational": "Babcock International",
  "dlapiper": "DLA Piper",
  "clifford-chance": "Clifford Chance",
  "allen-overy": "Allen & Overy",
  "transport-for-london": "Transport for London",
  "imperial-college-london": "Imperial College London",
  "london-school-of-economics": "London School of Economics",
  "london-stock-exchange-group": "London Stock Exchange Group",
  "carbon60global": "Carbon60",
  "network-rail": "Network Rail",
  "rio-tinto": "Rio Tinto",
  "nhs-scotland": "NHS Scotland",
  "nhs-england": "NHS England",
  "rolls-royce": "Rolls-Royce",
  "rs-components": "RS Components",
  "roc-search": "Roc Search",
  "university-of-oxford": "University of Oxford",
  "university-of-cambridge": "University of Cambridge",
  "thought-machine": "Thought Machine",
  "civil-service": "Civil Service",
  "mckinsey-uk": "McKinsey UK",
  "channel-4": "Channel 4",
  "turning-point": "Turning Point",
  "net-a-porter": "Net-A-Porter",
  "equiniti-ics": "Equiniti ICS",
  "smith-nephew": "Smith & Nephew",
  "anglo-american": "Anglo American",
  "sainsbury-s": "Sainsbury's",
  "directlinegroup": "Direct Line Group",
  "standardlife": "Standard Life",
  "nationalgrid": "National Grid",
  "jaguarlandrover": "Jaguar Land Rover",
  "dixonscarphone": "Dixons Carphone",
  "balfourbeatty": "Balfour Beatty",
  "freshfields": "Freshfields",
  "countrywide": "Countrywide",
  "postoffice": "Post Office",
  "healthassured": "Health Assured",
  "michaelpage": "Michael Page",
  "pagepersonnel": "Page Personnel",
  "edenbrown": "Eden Brown",
  "badenochandclark": "Badenoch & Clark",
  "venngroup": "Venn Group",
  "bluearrow": "Blue Arrow",
  "office-angels": "Office Angels",
  "robertwalters": "Robert Walters",
  "astoncarter": "Aston Carter",
  "teksystems": "TEKsystems",
  "clearslidemail": "ClearSlide",
  "careuk": "Care UK",
  "macegroup": "Mace Group",
  "swinton": "Swinton",
  "ashfords": "Ashfords",
  "improbable": "Improbable",
  "shopDirect": "Shop Direct",
  "homeserve": "HomeServe",
  "homeretailgroup": "Home Retail Group",
  "sabmiller": "SABMiller",
  "allianceboots": "Alliance Boots",
  "bsigroup": "BSI Group",
  "oxfamfrontliners": "Oxfam",
  "pdsmultinational": "PDS Multinational",
  "millwardbrown": "Millward Brown",
  "fremantlemedia": "Fremantle",
  "leadershipacademy": "NHS Leadership Academy",
  "bargainbooze": "Bargain Booze",
  "debenhams": "Debenhams",
  "rbs": "RBS",
  "jpmorgan": "JPMorgan",
  "twobirds": "Bird & Bird",
  "reckitt": "Reckitt",
  "specsavers": "Specsavers",
  "astrazeneca": "AstraZeneca",
  "matthey": "Johnson Matthey",
  "medacs": "Medacs Healthcare",
  "gattacaplc": "Gattaca",
  "worldpay": "Worldpay",
  "nottingham": "University of Nottingham",
  "manchester": "University of Manchester",
  "informa": "Informa",
  "shopdirect": "Shop Direct",
  "cokecce": "Coca-Cola Enterprises",
  "npbs": "NPBS",
  "example": "Example",
  "glassdoor": "Glassdoor",
  "biscuits": "United Biscuits",
  "finastra": "Finastra",
  "fircroft": "Fircroft",
  "realise": "Realise",
  "atkinsglobal": "Atkins",
  "mbplc": "Mitchells & Butlers",
};

/**
 * Format a company name from the database into a properly cased display name.
 * Checks known overrides first, then the slug, then applies smart title casing.
 */
export function formatCompanyName(name: string, slug?: string): string {
  // Check known names by slug first (more reliable)
  if (slug) {
    const bySlug = KNOWN_NAMES[slug.toLowerCase()];
    if (bySlug) return bySlug;
  }

  // Check by name (lowercased)
  const byName = KNOWN_NAMES[name.toLowerCase()];
  if (byName) return byName;

  // If the name already has mixed case (e.g., "GoCardless"), keep it
  if (name !== name.toLowerCase() && name !== name.toUpperCase() && name.length > 3) {
    return name;
  }

  // Smart title case as fallback
  return smartTitleCase(name);
}

function smartTitleCase(str: string): string {
  // Split on hyphens and spaces
  return str
    .replace(/[-_]/g, " ")
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 2) return word.toUpperCase(); // UK, AI, etc.
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
