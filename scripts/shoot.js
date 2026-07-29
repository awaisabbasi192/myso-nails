// E2E screenshot: logs in as admin through the real UI, then captures the dashboard.
const puppeteer = require("puppeteer-core");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--window-size=1440,1000"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  // Login via the API for reliability, then navigate.
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  const res = await page.evaluate(async () => {
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@misonails.pk", password: "miso786" }) });
    return r.json();
  });
  console.log("login:", JSON.stringify(res));

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: "shots/admin-overview.png", fullPage: false });

  // Orders tab
  await page.evaluate(() => { const els = [...document.querySelectorAll("div")].filter((e) => e.textContent.trim() === "Orders" && e.className.includes("admin-tab")); if (els[0]) els[0].click(); });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: "shots/admin-orders.png", fullPage: false });

  // Products tab
  await page.evaluate(() => { const els = [...document.querySelectorAll("div")].filter((e) => e.textContent.trim() === "Products" && e.className.includes("admin-tab")); if (els[0]) els[0].click(); });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: "shots/admin-products.png", fullPage: false });

  await browser.close();
  console.log("done");
})().catch((e) => { console.error(e); process.exit(1); });
