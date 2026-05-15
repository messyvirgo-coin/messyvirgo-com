/**
 * Eleventy global data — live Fund / Signal update (used by /fund-update/).
 */

const { fetchFundUpdateData } = require("../scripts/lib/fetch-fund-update-data");

module.exports = async function () {
  console.log("[fundUpdate] Fetching live data from api.messyvirgo.com…");
  const data = await fetchFundUpdateData({ useCli: false });
  console.log(
    `[fundUpdate] Done. ${data.funds.length} funds, macro ${data.macro?.score}, signal ${data.signalExample?.symbol || "—"}.`
  );
  return data;
};
