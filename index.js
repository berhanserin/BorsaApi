const { default: axios } = require("axios");
const express = require("express");

const app = express();

app.get("/borsa", async (req, res) => {
  const apis = await axios
    .get("https://bigpara.hurriyet.com.tr/api/v1/hisse/list")
    .then((r) => r.data.data)
    .catch((e) => console.log(e));
  const hisseData = await axios
    .get("https://www.sabah.com.tr/json/canli-borsa-verileri")
    .then((r) =>
      r.data
        .replace('~"});', "")
        .replace("callbackRT({", "")
        .replace(' "data" : "', "")
        .split("~")
    )
    .catch((e) => console.log(e));

  const dataLast = [];

  for (const item of apis) {
    const find = hisseData.find((x) => x.includes(item.kod));
    if (find) {
      const fiyat = find.split("|");
      const last = fiyat[2].replace(",", ".");
      const lastFiyat = fiyat[4];
      dataLast.push({
        name: item.ad,
        kod: item.kod,
        fiyat: fiyat[1],
        oran: fiyat[2],
        status:
          0 < last
            ? last > lastFiyat
              ? "+"
              : last < lastFiyat
              ? "-"
              : ""
            : last > lastFiyat
            ? "-"
            : last < lastFiyat
            ? "+"
            : "",
      });
    }
  }
  res.send({ data: dataLast });
});

app.listen(3000, () => {
  console.log("Server Aktif");
});
