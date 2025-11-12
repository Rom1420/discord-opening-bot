import fs from "fs";

const data = JSON.parse(fs.readFileSync("data/knownItems.json"));
const descriptionMap = new Map(data.descriptions.map((d) => [d.classid, d]));

for (const asset of data.assets) {
  const item = descriptionMap.get(asset.classid);
  if (item) {
    console.log(item.market_hash_name);
  }
}
