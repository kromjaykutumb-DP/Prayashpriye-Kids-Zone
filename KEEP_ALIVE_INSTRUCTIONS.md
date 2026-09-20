# Supabase Keep-Alive Setup

This script prevents your Supabase project from pausing due to inactivity by periodically sending pings to your project.

## Quick Start

### Manual Usage

Run the keep-alive script manually:

```bash
npm run keep-alive
```

This will ping your Supabase project every 30 minutes (default). To customize the interval:

```bash
node keep-alive.js 60  # Ping every 60 minutes
```

Press `Ctrl+C` to stop the script.

## Automated Scheduling

### Option 1: Using Task Scheduler (Windows)

1. Open Task Scheduler (`taskschd.msc`)
2. Click "Create Task" in the right panel
3. **General tab:**
   - Name: "Supabase Keep-Alive"
   - Select "Run whether user is logged on or not"
   - Check "Run with highest privileges"
4. **Triggers tab:**
   - Click "New"
   - Select "Daily"
   - Set repeat task every 30 minutes for a duration of "Indefinitely"
5. **Actions tab:**
   - Click "New"
   - Action: "Start a program"
   - Program/script: `node`
   - Add arguments: `keep-alive.js`
   - Start in: `E:\DOWNLOADS\KID'S ZONE\project`
6. **Conditions tab:**
   - Uncheck "Start the task only if the computer is on AC power"
   - Uncheck "Stop if the computer switches to battery power"
7. Click OK and enter your Windows password when prompted

### Option 2: Using PM2 (Process Manager)

PM2 is a process manager for Node.js that keeps your script running and restarts it if it crashes.

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the keep-alive script with PM2:
```bash
cd "E:\DOWNLOADS\KID'S ZONE\project"
pm2 start keep-alive.js --name supabase-keep-alive
```

3. Set PM2 to start on system boot:
```bash
pm2 startup
pm2 save
```

4. Useful PM2 commands:
```bash
pm2 status              # Check status
pm2 logs supabase-keep-alive  # View logs
pm2 stop supabase-keep-alive  # Stop the script
pm2 delete supabase-keep-alive # Remove from PM2
pm2 restart supabase-keep-alive # Restart the script
```

### Option 3: Using Node-cron (Simple Alternative)

If you prefer a simpler approach, you can modify the script to use node-cron:

1. Install node-cron:
```bash
npm install node-cron
```

2. Create a new file `keep-alive-cron.js`:

```javascript
const cron = require('node-cron');
const https = require('https');

const SUPABASE_URL = 'https://otgeplfjbxildbzgwnxt.supabase.co';

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
      console.log(`[${new Date().toISOString()}] Keep-alive ping successful: ${res.statusCode}`);
      resolve();
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

// Run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    await pingSupabase();
  } catch (error) {
    console.error('Ping failed, will retry next interval...');
  }
});

console.log('Keep-alive cron job started. Pinging every 30 minutes...');
```

3. Run it:
```bash
node keep-alive-cron.js
```

## Monitoring

To verify the keep-alive is working:

1. Check the console output for successful ping messages
2. Monitor your Supabase dashboard for activity
3. Check the script logs if using PM2: `pm2 logs supabase-keep-alive`

## Troubleshooting

**Script not working:**
- Ensure you have an internet connection
- Check that the Supabase URL is correct
- Verify no firewall is blocking the requests

**Task Scheduler not running:**
- Check Task Scheduler history for errors
- Ensure your Windows account has a password set
- Verify the path to `node.exe` is correct or use full path

**PM2 not starting on boot:**
- Run `pm2 startup` again and follow the instructions
- Ensure you ran `pm2 save` after starting the script
- Check Windows services for PM2

## Customization

You can modify the ping interval by:
- Changing the command line argument: `node keep-alive.js 60` (for 60 minutes)
- Editing the `DEFAULT_INTERVAL_MINUTES` constant in `keep-alive.js`
- Adjusting the cron schedule in the node-cron version

## Important Notes

- The script sends lightweight GET requests to your Supabase project
- This won't count as significant API usage or incur costs
- The script should run continuously to prevent project pausing
- Consider monitoring the script to ensure it's running properly
