import { mcp_firecrawl_search } from "@/lib/firecrawl";

// --- Helper: Time Conversion ---

// Helper to get approximate offset using Intl.DateTimeFormat
function getTimezoneOffset(timeZone: string, date: Date): number | null {
  try {
    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'shortOffset',
      timeZone: timeZone,
    });
    const formattedString = offsetFormatter.format(date); // e.g., "GMT-4" or "GMT+5:30"
    const offsetMatch = formattedString.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!offsetMatch) {
      console.warn(`Could not parse offset from string: ${formattedString} for timezone ${timeZone}`);
      return null;
    }
    const sign = offsetMatch[1] === '+' ? 1 : -1;
    const hours = parseInt(offsetMatch[2], 10);
    const minutes = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0;
    return sign * (hours * 60 + minutes); // Return offset in minutes from GMT/UTC
  } catch (e) {
     console.error(`Failed to get offset for timezone ${timeZone}:`, e);
    return null;
  }
}

// Helper to format hour in AM/PM
function formatHour(hour24: number): string {
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 < 12 || hour24 === 24 ? 'AM' : 'PM';
  return `${hour12}:00 ${period}`;
}

function convertTimeToEastern(localTimeStr: string, sourceTimezone: string): string {
  const easternTimeZone = "America/New_York";

  if (sourceTimezone === easternTimeZone) {
    return localTimeStr.toUpperCase().includes("ET") ? localTimeStr : `${localTimeStr} ET`;
  }
  // Handle UTC specifically
  if (sourceTimezone === "UTC") {
    // The logic inside getOptimalOutreachTime defaults UTC to "10:00 AM - 11:00 AM"
    // We need to convert 10:00 AM UTC to Eastern Time.
    const utcHour = 10; // 10 AM UTC
    const now = new Date(); 
    // Create a date object representing 10 AM UTC today
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), utcHour, 0, 0));

    try {
      const etFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: easternTimeZone, hour: 'numeric', minute: 'numeric', hour12: true
      });
      const easternTimeStr = etFormatter.format(utcDate);
      // Calculate end time (+1 hour)
      const utcEndDate = new Date(utcDate.getTime() + 60 * 60 * 1000);
      const easternEndTimeStr = etFormatter.format(utcEndDate);
      return `${easternTimeStr} - ${easternEndTimeStr} ET`;
    } catch (e) {
      console.error("Error formatting UTC to Eastern:", e);
      return "Conversion Error (UTC)";
    }
  }

  const timeParts = localTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!timeParts) {
    console.warn(`Could not parse local time string: ${localTimeStr}`);
    return "Invalid Time";
  }

  let localStartHour = parseInt(timeParts[1], 10);
  const period = timeParts[3].toUpperCase();

  if (period === "PM" && localStartHour !== 12) localStartHour += 12;
  else if (period === "AM" && localStartHour === 12) localStartHour = 0;

  const now = new Date();

  try {
    let sourceDateFormatter = new Intl.DateTimeFormat('en-CA', {
       timeZone: sourceTimezone, year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const dateParts = sourceDateFormatter.format(now).split('-');
    const dateStringForParsing = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${String(localStartHour).padStart(2, '0')}:00:00`;
    const targetDate = new Date(dateStringForParsing);

    if (isNaN(targetDate.getTime())) {
       console.warn(`Could not create valid date for parsing: ${dateStringForParsing}`);
       return "Conversion Error (Date Parse)";
    }

    const etFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: easternTimeZone, hour: 'numeric', minute: 'numeric', hour12: true
    });
    const easternTimeStr = etFormatter.format(targetDate);
    const targetEndDate = new Date(targetDate.getTime() + 60 * 60 * 1000);
    const easternEndTimeStr = etFormatter.format(targetEndDate);
    return `${easternTimeStr} - ${easternEndTimeStr} ET`;

  } catch (e) {
    console.error(`Error formatting time for timezone ${sourceTimezone} to ${easternTimeZone}:`, e);
    const sourceOffset = getTimezoneOffset(sourceTimezone, now);
    const easternOffset = getTimezoneOffset(easternTimeZone, now);
    if (sourceOffset === null || easternOffset === null) return "Conversion Error (Offset)";
    const hourDiff = (easternOffset - sourceOffset) / 60;
    const easternStartHour = (localStartHour - hourDiff + 24) % 24;
    const easternEndHour = (easternStartHour + 1) % 24;
    return `${formatHour(easternStartHour)} - ${formatHour(easternEndHour)} ET (Approx.)`;
  }
}

// --- End Helper: Time Conversion ---


// --- Location and Timezone Logic ---

function parseLocationFromSearchResults(searchResults: any): string | null {
  if (!searchResults?.results?.length) {
    console.log("No valid search results found for location parsing.");
    return null;
  }

  console.log("Analyzing search results for location:",
    JSON.stringify(searchResults.results.slice(0, 2).map((r: any) => ({
      title: r.title, snippet: r.description?.substring(0, 100)
    }))));

  let possibleLocations: string[] = [];
  const locationPatterns = [
    /located in ([^,.]+)/i, /headquartered in ([^,.]+)/i, /based in ([^,.]+)/i,
    /offices? in ([^,.]+)/i, /location: ([^,.]+)/i, /headquarters in ([^,.]+)/i,
    /headquarters: ([^,.]+)/i, /hq in ([^,.]+)/i, /hq: ([^,.]+)/i
  ];

  for (const result of searchResults.results) {
    const fullText = (result.title || '') + ' ' + (result.description || '');
    for (const pattern of locationPatterns) {
      const match = fullText.match(pattern);
      if (match?.[1]) {
        const location = match[1].trim();
        console.log(`Found location via pattern "${pattern}": "${location}"`);
        possibleLocations.push(location);
      }
    }
  }

  if (possibleLocations.length > 0) {
    console.log(`Found ${possibleLocations.length} possible locations: ${possibleLocations.join(', ')}`);
    // Basic filtering/prioritization could happen here if needed
    return possibleLocations[0]; // Return the first found for now
  }

  // Fallback: common city check (less reliable)
  const commonCities = ["new york", "chicago", "los angeles", "san francisco", "boston", "london", "paris", "berlin"]; // Add more as needed
  for (const result of searchResults.results) {
    const lowerContent = ((result.title || '') + ' ' + (result.description || '')).toLowerCase();
    for (const city of commonCities) {
      if (lowerContent.includes(city)) {
        console.log(`Found fallback city name in content: "${city}"`);
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
  }

  console.log("Could not determine location from search results.");
  return "Unknown Location";
}

function getTimezoneFromLocation(location: string): string {
  if (!location || location === "Unknown Location") {
      console.log("Location is unknown, defaulting timezone to UTC.");
      return "UTC"; // Default to UTC if location isn't found
  }
  
  const normalizedLocation = location.toLowerCase().trim();
  console.log(`Mapping location "${normalizedLocation}" to timezone`);

  // Expanded mapping
  const timezoneMap: Record<string, string> = {
    // US cities
    "new york": "America/New_York", "nyc": "America/New_York", "manhattan": "America/New_York",
    "boston": "America/New_York",
    "washington": "America/New_York", "dc": "America/New_York",
    "philadelphia": "America/New_York",
    "atlanta": "America/New_York",
    "miami": "America/New_York",
    "cincinnati": "America/New_York",
    "chicago": "America/Chicago",
    "dallas": "America/Chicago", "dfw": "America/Chicago",
    "houston": "America/Chicago",
    "austin": "America/Chicago",
    "denver": "America/Denver",
    "phoenix": "America/Phoenix",
    "los angeles": "America/Los_Angeles", "la": "America/Los_Angeles",
    "san francisco": "America/Los_Angeles", "sf": "America/Los_Angeles", "bay area": "America/Los_Angeles",
    "seattle": "America/Los_Angeles",
    "portland": "America/Los_Angeles",

    // US regions
    "east coast": "America/New_York", "eastern": "America/New_York",
    "west coast": "America/Los_Angeles", "pacific": "America/Los_Angeles",
    "midwest": "America/Chicago", "central": "America/Chicago",
    "mountain": "America/Denver",

    // Europe
    "london": "Europe/London", // Added London
    "paris": "Europe/Paris",
    "berlin": "Europe/Berlin",
    "madrid": "Europe/Madrid",
    "rome": "Europe/Rome",
    "amsterdam": "Europe/Amsterdam",
    "brussels": "Europe/Brussels",
    "zurich": "Europe/Zurich",
    "frankfurt": "Europe/Berlin",

    // Asia
    "tokyo": "Asia/Tokyo",
    "singapore": "Asia/Singapore",
    "hong kong": "Asia/Hong_Kong",
    "beijing": "Asia/Shanghai",
    "shanghai": "Asia/Shanghai",
    "seoul": "Asia/Seoul",
    "mumbai": "Asia/Kolkata",
    "delhi": "Asia/Kolkata",

    // Australia/NZ
    "sydney": "Australia/Sydney",
    "melbourne": "Australia/Melbourne",
    "auckland": "Pacific/Auckland",

    // Canada
    "toronto": "America/Toronto",
    "vancouver": "America/Vancouver",
    "montreal": "America/Montreal",

    // Countries/General Fallbacks
    "united states": "America/New_York", "usa": "America/New_York",
    "uk": "Europe/London", "united kingdom": "Europe/London",
    "germany": "Europe/Berlin",
    "france": "Europe/Paris",
    "canada": "America/Toronto",
    // Add more countries or broader regions if needed
  };

  if (timezoneMap[normalizedLocation]) {
    console.log(`Direct match found for "${normalizedLocation}": ${timezoneMap[normalizedLocation]}`);
    return timezoneMap[normalizedLocation];
  }

  for (const key in timezoneMap) {
    if (normalizedLocation.includes(key)) {
      console.log(`Partial match found for "${normalizedLocation}" contains "${key}": ${timezoneMap[key]}`);
      return timezoneMap[key];
    }
  }

  console.log(`No specific timezone found for "${normalizedLocation}", defaulting to UTC.`);
  return "UTC"; // More sensible default than NY
}


function getOptimalOutreachTime(timezone: string, title: string | null): { time: string, reason: string } {
  console.log(`Determining optimal outreach time for timezone: ${timezone} and title: ${title}`);
  let time: string;
  let reason: string;
  const lowerTitle = title?.toLowerCase() || ''; // Normalize title for easier matching

  // --- Role-Specific Keywords (from document) ---
  const isBanker = lowerTitle.includes('banker') || lowerTitle.includes('analyst') || lowerTitle.includes('associate');
  const isAdvisor = lowerTitle.includes('advisor') || lowerTitle.includes('financial planner');
  const isTrader = lowerTitle.includes('trader') || lowerTitle.includes('portfolio manager') || lowerTitle.includes('fund manager');
  const isAccountant = lowerTitle.includes('accountant') || lowerTitle.includes('cpa') || lowerTitle.includes('auditor');
  const isExecutive = lowerTitle.includes('cfo') || lowerTitle.includes('chief') || lowerTitle.includes('vp') || lowerTitle.includes('director') || lowerTitle.includes('head');
  // Add more role detections as needed

  // --- Base Timing Logic by Timezone, Modified by Role ---

  if (timezone.startsWith('America/Los_Angeles')) { // PT
    if (isTrader) { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning PT (avoids market open volatility)"; } // Avoid 6:30 AM open
    else if (isAdvisor) { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning PT (potential advisor availability)"; }
    else { time = "9:00 AM - 10:00 AM"; reason = "Early morning PT (general)"; }
  } else if (timezone.startsWith('America/Denver')) { // MT
    if (isTrader) { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning MT (avoids market open volatility)"; } // Avoid 7:30 AM open
    else if (isAdvisor) { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning MT (potential advisor availability)"; }
    else { time = "9:00 AM - 10:00 AM"; reason = "Morning MT (general)"; }
  } else if (timezone.startsWith('America/Phoenix')) { // AZ
     // Simplified for AZ - assuming standard business times OK, avoiding market open if trader
     if (isTrader) { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning AZ (avoids potential market open time)"; }
     else { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning AZ (general)"; }
  } else if (timezone.startsWith('America/Chicago')) { // CT
    if (isTrader) { time = "10:30 AM - 11:30 AM"; reason = "Late morning CT (after market open)"; } // Avoid 8:30 AM open
    else if (isAdvisor) { time = "1:00 PM - 2:00 PM"; reason = "Early afternoon CT (potential advisor availability)"; }
    else if (isExecutive) { time = "2:00 PM - 3:00 PM"; reason = "Mid-afternoon CT (potential exec availability)"; }
    else { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning CT (general)"; }
  } else if (timezone.startsWith('America/New_York') || timezone.startsWith('America/Toronto') || timezone.startsWith('America/Montreal')) { // ET
    if (isTrader) { time = "11:00 AM - 12:00 PM"; reason = "Late morning ET (after market open)"; } // Avoid 9:30 AM open
    else if (isBanker) { time = "2:00 PM - 3:00 PM"; reason = "Mid-afternoon ET (potential banker window)"; }
    else if (isAdvisor) { time = "3:00 PM - 4:00 PM"; reason = "Late afternoon ET (potential advisor window)"; }
    else if (isExecutive) { time = "2:30 PM - 3:30 PM"; reason = "Mid-afternoon ET (potential exec window)"; }
    else { time = "1:00 PM - 2:00 PM"; reason = "Early afternoon ET (general)"; }
  } else if (timezone.startsWith('Europe/London')) { // UK
    if (isTrader) { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning UK (after market open)"; } // Avoid 8:00 AM open
    else if (isBanker) { time = "2:00 PM - 3:00 PM"; reason = "Mid-afternoon UK (potential banker window)"; }
    else { time = "10:00 AM - 11:00 AM"; reason = "Late morning UK (general)"; }
  } else if (timezone.startsWith('Europe/')) { // Other Europe
    // Assuming CET-like timing
    if (isTrader) { time = "10:00 AM - 11:00 AM"; reason = "Mid-morning Europe (after market open)"; } // Avoid 9:00 AM open
    else { time = "11:00 AM - 12:00 PM"; reason = "Late morning European time (general)"; }
  } else if (timezone.startsWith('Asia/') || timezone.startsWith('Australia/')) { // APAC
    // General morning suggestion for APAC
     time = "9:00 AM - 10:00 AM"; reason = "Morning APAC time (general)";
  } else { // Default/UTC
    time = "10:00 AM - 11:00 AM"; reason = "General business hours (10-11 AM assumed local)";
  }

  // --- Add Busy Season Check (Basic Example for Accountants) ---
  if (isAccountant) {
      const currentMonth = new Date().getMonth(); // 0 = January, 1 = February, etc.
      // Check if current month is within Jan-Apr tax season
      if (currentMonth >= 0 && currentMonth <= 3) {
          reason += " - Warning: Accountant busy season (Jan-Apr)";
          // Optionally, could change the time suggestion or add a stronger warning
      }
  }

  console.log(`Selected optimal time for ${title}: ${time} (${reason})`);
  return { time, reason };
}

// --- End Location and Timezone Logic ---


// --- Main Enrichment Function ---

export interface EnrichmentData {
    location: string | null;
    timezone: string | null;
    optimal_outreach_time: string | null; // Use DB naming convention
    optimal_outreach_time_eastern: string | null; // Use DB naming convention
    outreach_reason: string | null;
}

export async function enrichLead(companyName: string | null, title: string | null): Promise<EnrichmentData> {
    const defaultResult: EnrichmentData = {
        location: null, timezone: null, optimal_outreach_time: null,
        optimal_outreach_time_eastern: null, outreach_reason: null
    };

    if (!companyName) {
        console.log("No company name provided for enrichment.");
        return defaultResult;
    }

    try {
        console.log(`Starting enrichment for company: ${companyName} (${title})`);
        const searchTerm = `${companyName} headquarters location`;
        let searchResults = null;

        try {
            searchResults = await mcp_firecrawl_search({ query: searchTerm, limit: 3 });
            console.log(`Enrichment search got ${searchResults?.results?.length || 0} results.`);
        } catch (searchErr) {
            console.error("Error during firecrawl search for enrichment:", searchErr);
            // Optional: retry or return default if search fails critically
            // return defaultResult;
        }

        const location = parseLocationFromSearchResults(searchResults);
        if (!location || location === "Unknown Location") {
             console.log("Could not determine location, enrichment incomplete.");
             return { ...defaultResult, location: "Unknown Location", timezone: "UTC" }; // Still return Unknown/UTC
        }

        const timezone = getTimezoneFromLocation(location);
        const { time: optimalLocalTime, reason } = getOptimalOutreachTime(timezone, title);
        const optimalEasternTime = convertTimeToEastern(optimalLocalTime, timezone);

        console.log(`Enrichment complete for ${companyName} (${title}): ${location} (${timezone}) -> Local: ${optimalLocalTime}, ET: ${optimalEasternTime}`);

        return {
            location: location,
            timezone: timezone,
            optimal_outreach_time: optimalLocalTime,
            optimal_outreach_time_eastern: optimalEasternTime,
            outreach_reason: reason
        };

    } catch (error) {
        console.error(`Unexpected error during enrichment for ${companyName} (${title}):`, error);
        return defaultResult; // Return default on unexpected errors
    }
}
// --- End Main Enrichment Function --- 