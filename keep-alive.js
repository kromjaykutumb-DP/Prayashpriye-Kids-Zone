#!/usr/bin/env node

/**
 * Keep-Alive Script for Supabase Project
 * This script periodically pings your Supabase project to prevent it from pausing due to inactivity.
 * 
 * Usage: node keep-alive.js [interval_minutes]
 * Default interval: 30 minutes
 */

import https from 'https';

// Configuration
const SUPABASE_URL = 'https://otgeplfjbxildbzgwnxt.supabase.co';
const DEFAULT_INTERVAL_MINUTES = 30;
const intervalMinutes = process.argv[2] ? parseInt(process.argv[2]) : DEFAULT_INTERVAL_MINUTES;

function pingSupabase() {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'User-Agent': 'Supabase-Keep-Alive/1.0',
        'Accept': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`[${new Date().toISOString()}] Keep-alive ping successful: ${res.statusCode}`);
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] Keep-alive ping failed:`, error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runKeepAlive() {
  console.log(`Starting Supabase keep-alive for: ${SUPABASE_URL}`);
  console.log(`Ping interval: ${intervalMinutes} minutes`);
  console.log('Press Ctrl+C to stop\n');

  // Initial ping
  try {
    await pingSupabase();
  } catch (error) {
    console.error('Initial ping failed, but will continue scheduling...');
  }

  // Schedule periodic pings
  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(async () => {
    try {
      await pingSupabase();
    } catch (error) {
      console.error('Ping failed, will retry next interval...');
    }
  }, intervalMs);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nKeep-alive script stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nKeep-alive script terminated');
  process.exit(0);
});

// Start the keep-alive
runKeepAlive().catch(error => {
  console.error('Failed to start keep-alive:', error);
  process.exit(1);
});
