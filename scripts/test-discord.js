#!/usr/bin/env node

/**
 * Test Discord Notification
 * Simple script to test Discord webhook
 */

const https = require('https');
const { URL } = require('url');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.error('❌ DISCORD_WEBHOOK_URL not set');
  process.exit(1);
}

console.log('🔔 Sending test Discord notification...');

const payload = JSON.stringify({
  embeds: [{
    title: "👋 Hello World from GitHub Actions!",
    description: "This is a test notification from the Campus Learning Dashboard automation.",
    color: 3447003, // Blue color
    timestamp: new Date().toISOString(),
    fields: [
      {
        name: "Status",
        value: "✅ Discord webhook is working!",
        inline: true
      },
      {
        name: "Source",
        value: "GitHub Actions Test",
        inline: true
      }
    ],
    footer: {
      text: "Campus Learning Dashboard - Test Notification"
    }
  }]
});

const url = new URL(WEBHOOK_URL);

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  
  res.on('data', (d) => {
    if (res.statusCode !== 204) {
      process.stdout.write(d);
    }
  });
  
  res.on('end', () => {
    if (res.statusCode === 204 || res.statusCode === 200) {
      console.log('🎉 Discord notification sent successfully!');
      process.exit(0);
    } else {
      console.error('❌ Failed to send Discord notification');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error sending Discord notification:', error.message);
  process.exit(1);
});

req.write(payload);
req.end();
