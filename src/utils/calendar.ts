import { GOOGLE_CONFIG, validateGoogleConfig } from '../config/google';
import { getFromStore, putInStore } from './db';
import { DateTime } from 'luxon';

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
];

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

function convertToTimeZone(year: number, month: number, day: number, timeZone: string) {
  // Step 1: Create a DateTime object in the provided timezone
  const dateTimeInTimeZone = DateTime.fromObject(
    { year, month, day },
    { zone: timeZone }
  );

  // Step 2: Set the time to midnight (00:00:00)
  const midnightDateTime = dateTimeInTimeZone.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

  console.log('Midnight Date in TimeZone:', midnightDateTime.toFormat('EEE MMM dd yyyy HH:mm:ss ZZZZ'));

  // Step 3: Return the result in the desired string format
  return midnightDateTime; // This will return the date in the string format for the given timezone
}

async function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }
    
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onerror = () => reject(new Error('Failed to load GAPI script'));
    gapiScript.onload = () => {
      // Give GAPI time to initialize
      setTimeout(resolve, 100);
    };
    document.head.appendChild(gapiScript);
  });
}
    
async function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }
    
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
        // Give scripts a moment to initialize
    gisScript.defer = true;
    gisScript.onerror = () => reject(new Error('Failed to load GSI script'));
    gisScript.onload = () => {
      // Give GSI time to initialize
      setTimeout(resolve, 100);
    };
    document.head.appendChild(gisScript);
  });
}

export async function initializeGoogleCalendar(): Promise<void> {
  try {
    validateGoogleConfig();
    
    // Load required scripts
    await Promise.all([
      loadGapiScript(),
      loadGsiScript()
    ]);
    
    // Ensure GAPI is available
    if (!window.gapi) {
      throw new Error('GAPI not loaded');
    }

    // Initialize GAPI client
    await new Promise<void>((resolve, reject) => {
      window.gapi.load('client', {
        callback: resolve,
        onerror: () => reject(new Error('Failed to load GAPI client')),
        timeout: 5000,
        ontimeout: () => reject(new Error('Timeout loading GAPI client'))
      });
    });

    // Initialize GAPI client with discovery docs
    console.log('Initializing GAPI client...');
    await window.gapi.client.init({
      apiKey: GOOGLE_CONFIG.apiKey,
      discoveryDocs: DISCOVERY_DOCS
    });
    gapiInited = true;

    // Give GAPI client a moment to initialize
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    // Initialize token client
    console.log('Initializing token client...');
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CONFIG.clientId,
      scope: GOOGLE_CONFIG.scopes.join(' '),
      prompt: 'consent',
      callback: async (response: any) => {
        if (response.error) {
          throw new Error(`Authorization failed: ${response.error}`);
          return;
        }
        
        if (response.access_token) {
          await putInStore('calendarAuth', {
            token: response.access_token,
            expiry: Date.now() + (response.expires_in * 1000)
          });
          console.log('Token stored successfully');
        }
      }
    });
    gisInited = true;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown initialization error';
    throw new Error(`Failed to initialize Google Calendar: ${errorMessage}`);
  }
}

export async function authenticateCalendar(): Promise<void> {
  try {
    if (!gapiInited || !gisInited || !tokenClient) {
      console.log('Initializing Google Calendar...');
      await initializeGoogleCalendar();
    }

    const auth = await getFromStore('calendarAuth', 'token');
    if (!auth || Date.now() >= auth?.expiry) {
      return new Promise((resolve, reject) => {
        tokenClient.callback = async (response: any) => {
          console.log('Token client callback received');
          if (response?.error) {
            reject(new Error(`Authorization failed: ${response.error}`));
            return;
          }
          
          if (response.access_token) {
            try {
              console.log('Storing new auth token');
              await putInStore('calendarAuth', {
                token: response.access_token,
                expiry: Date.now() + 3600000 // 1 hour expiry
              });
              resolve();
            } catch (error) {
              reject(new Error('Failed to store authentication token'));
            }
          }
        };
        
        try {
          console.log('Requesting access token');
          tokenClient.requestAccessToken();
        } catch (err) {
          reject(new Error('Failed to request access token'));
        }
      });
    }
  } catch (error) {
    console.error('Calendar authentication error:', error);
    throw error;
  }
}

export async function getAvailableSlotsFromNylas(email: string, date: Date, duration: number = 30, timeZone: string): Promise<Date[]> {
  // Check if the date is a Sunday (0 is Sunday in JavaScript)
  
  if (date.getDay() === 0) {
    return [];
  }
  
  // const timeZone = 'America/Chicago';
  console.log("date:- ", date.getFullYear(), date.getMonth(), date.getDate())
  // Convert date to Central Time
  const newDate = convertToTimeZone(date.getFullYear(), date.getMonth() + 1, date.getDate(), timeZone);
  console.log('Converted Date:', newDate);
 

  // Set start time to 10 AM Central (same day)
  const startTime = newDate

  // Convert start and end times to Unix timestamps (seconds)
  console.log("new data i s", Number(newDate))
  const startTimeUnix = (Number(newDate) / 1000) + (10 * 3600);
  const endTimeUnix = (Number(newDate) / 1000) + (18 * 3600);
  console.log("starta dafsesf", startTime, endTimeUnix)
  // Construct the API request body
  const requestBody = {
    participants: [
      {
        email: email,
        calendar_ids: ["primary"],
        open_hours: [
          {
            days: [0, 1, 2, 3, 4, 5, 6],
            timezone: timeZone,
            start: "10:00",
            end: "18:00"
          }
        ]
      }
    ],
    start_time: startTimeUnix,
    end_time: endTimeUnix,
    duration_minutes: 30,
    availability_rules: {
      availability_method: "collective",

    }
  };
  // Fetch availability from Nylas API
  try {
    const response = await fetch('https://api.us.nylas.com/v3/calendars/availability', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, application/gzip',
        'Authorization': `Bearer ${import.meta.env.VITE_NYLAS_API_SECRET_KEY}`, // Replace with actual API key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });


    const data = await response.json();
    console.log('Available slots:', data);

    const availableSlots: Date[] = [];

    // Loop through the time_slots from the API response
  data.data.time_slots.forEach((slot: { start_time: number; end_time: number }) => {
    // Convert start_time and end_time to America/Chicago timezone
    const startTimeUTC = new Date(slot.start_time * 1000);
    const endTimeUTC = new Date(slot.end_time * 1000);

    let currentSlot = startTimeUTC;
    while (currentSlot < endTimeUTC) {
      availableSlots.push(new Date(currentSlot)); // Add current slot
      currentSlot = new Date(currentSlot.getTime() + 30 * 60000); // Increment by 30 minutes
    }
  });
    

  const convertedDates = availableSlots.map((date) => {
    // Create a Luxon DateTime object from the Date object
    const luxonDate = DateTime.fromJSDate(date, { zone: 'Asia/Kolkata' });
  
    // Convert it to the desired timezone
    const zonedDate = luxonDate.setZone(timeZone);
  
    // Format the date similar to 'Thu Oct 10 2024 21:30:00 GMT+0530 (India Standard Time)'
    return zonedDate.toLocaleString({
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  });
  
  console.log(convertedDates);

    return availableSlots;

  } catch (error) {
    console.error('Error fetching available slots:', error);
    return [];
  }
}


export async function getAvailableSlots(
  date: Date,
  duration: number = 30
): Promise<Date[]> {
  // Check if the date is a Sunday (0 is Sunday in JavaScript)
  if (date.getDay() === 0) {
    return [];
  }

  // Convert date to Central Time
  const centralDate = new Date(date.toLocaleString('en-US', {
    timeZone: 'America/Chicago'
  }));
  
  // Set start time to 10 AM Central
  const startTime = new Date(centralDate);
  startTime.setHours(10, 0, 0, 0);

  // Set end time to 6 PM Central
  const endTime = new Date(centralDate);
  endTime.setHours(18, 0, 0, 0);

  try {
    const availableSlots: Date[] = [];
    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
      availableSlots.push(new Date(currentSlot));
      // Add 30 minutes for next slot
      currentSlot = new Date(currentSlot.getTime() + duration * 60000);
    }

    return availableSlots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
}

export async function createCalendarEvent(event: {
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  attendees?: Array<{ email: string }>;
}): Promise<any> {
  try {
    const auth = await getFromStore('calendarAuth', 'token');
    if (!auth || Date.now() >= auth.expiry) {
      await authenticateCalendar();
    }

    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return response.result;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}