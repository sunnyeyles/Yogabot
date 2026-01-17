#!/usr/bin/env node

/**
 * Health Check Script for Yoga Chatbot
 *
 * This script checks the health of the deployed chatbot
 * Run with: node scripts/health-check.js
 */

const https = require("https");
const http = require("http");

const PRODUCTION_URL = "https://yogabot2.vercel.app";
const STAGING_URL = "https://yogabot2-staging.vercel.app"; // Update this if you have staging

async function checkHealth(url, environment) {
  console.log(`\n🔍 Checking ${environment} environment...`);
  console.log(`URL: ${url}`);

  try {
    const healthData = await makeRequest(`${url}/api/health`);

    if (healthData.status === "healthy") {
      console.log("✅ Health check passed");
      console.log(`   Version: ${healthData.version}`);
      console.log(`   Uptime: ${Math.round(healthData.uptime)}s`);
      console.log(`   Iframe: ${healthData.services.iframe.status}`);
    } else {
      console.log("❌ Health check failed");
      console.log(`   Status: ${healthData.status}`);
      if (healthData.error) {
        console.log(`   Error: ${healthData.error}`);
      }
    }

    return healthData.status === "healthy";
  } catch (error) {
    console.log("❌ Health check failed");
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkEmbedScript(url, environment) {
  console.log(`\n🔍 Checking embed script for ${environment}...`);

  try {
    const embedScript = await makeRequest(`${url}/embed.js`);
    if (embedScript && embedScript.length > 100) {
      console.log("✅ Embed script accessible");
      return true;
    } else {
      console.log("❌ Embed script not accessible or too short");
      return false;
    }
  } catch (error) {
    console.log("❌ Embed script check failed");
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkIframe(url, environment) {
  console.log(`\n🔍 Checking iframe for ${environment}...`);

  try {
    const iframeResponse = await makeRequest(`${url}/iframe`);
    if (iframeResponse && iframeResponse.includes("yoga-chatbot")) {
      console.log("✅ Iframe accessible");
      return true;
    } else {
      console.log("❌ Iframe not accessible or invalid content");
      return false;
    }
  } catch (error) {
    console.log("❌ Iframe check failed");
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    const req = client.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.headers["content-type"]?.includes("application/json")) {
            resolve(JSON.parse(data));
          } else {
            resolve(data);
          }
        } catch (error) {
          reject(new Error("Failed to parse response"));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function main() {
  console.log("🏥 Yoga Chatbot Health Check");
  console.log("============================");

  const results = {
    production: { health: false, embed: false, iframe: false },
    staging: { health: false, embed: false, iframe: false },
  };

  // Check production
  results.production.health = await checkHealth(PRODUCTION_URL, "Production");
  results.production.embed = await checkEmbedScript(
    PRODUCTION_URL,
    "Production"
  );
  results.production.iframe = await checkIframe(PRODUCTION_URL, "Production");

  // Check staging (if available)
  // Uncomment the following lines if you have a staging environment
  // results.staging.health = await checkHealth(STAGING_URL, 'Staging');
  // results.staging.embed = await checkEmbedScript(STAGING_URL, 'Staging');
  // results.staging.iframe = await checkIframe(STAGING_URL, 'Staging');

  // Summary
  console.log("\n📊 Summary");
  console.log("==========");

  const prodHealthy =
    results.production.health &&
    results.production.embed &&
    results.production.iframe;
  console.log(
    `Production: ${prodHealthy ? "✅ Healthy" : "❌ Issues detected"}`
  );

  // if (results.staging.health !== undefined) {
  //   const stagingHealthy = results.staging.health && results.staging.embed && results.staging.iframe;
  //   console.log(`Staging: ${stagingHealthy ? '✅ Healthy' : '❌ Issues detected'}`);
  // }

  if (!prodHealthy) {
    console.log("\n🚨 Action Required:");
    console.log("   - Check Vercel deployment logs");
    console.log("   - Verify environment variables");
    console.log("   - Test chatbot functionality manually");
    process.exit(1);
  } else {
    console.log("\n🎉 All systems operational!");
    process.exit(0);
  }
}

// Run the health check
main().catch((error) => {
  console.error("Health check script failed:", error);
  process.exit(1);
});
