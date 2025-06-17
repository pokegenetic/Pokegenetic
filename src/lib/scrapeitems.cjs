const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const URL = "https://www.serebii.net/scarletviolet/items.shtml";
const EXCLUDED_CATEGORIES = ["Key Items", "Ingredients"];

async function scrapeItems() {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);
    const items = [];

    $("table.dextable").each((i, table) => {
      const categoryHeader = $(table).prevAll("h3").first();
      const category = categoryHeader.text().trim();

      if (EXCLUDED_CATEGORIES.includes(category)) {
        console.log(`⏭️ Skipping excluded category: ${category}`);
        return;
      }

      console.log(`📦 Processing category: ${category}`);

      $(table)
        .find("tr")
        .slice(1)
        .each((j, row) => {
          const cols = $(row).find("td");
          if (cols.length < 3) return;

          const img = $(cols[0]).find("img").attr("src") || "";
          const sprite = img.startsWith("https") ? img : `https://www.serebii.net${img}`;
          const name = $(cols[1]).text().trim().replace(/\s+/g, " ");
          const effect = $(cols[2]).text().trim().replace(/\s+/g, " ");

          if (name && effect && sprite) {
            items.push({ name, effect, sprite });
          }
        });
    });

    const output = `export const items_sv = ${JSON.stringify(items, null, 2)};\n`;
    const filePath = path.join(__dirname, "items_sv.ts");
    fs.writeFileSync(filePath, output);
    console.log(`✅ Extracted ${items.length} items into items_sv.ts`);
  } catch (error) {
    console.error("❌ Error scraping items:", error);
  }
}

scrapeItems();