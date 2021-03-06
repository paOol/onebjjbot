let path = require("path");
let winston = require("winston");
let conf = require("../config/config.js");
let _ = require("lodash");
let request = require("request");
let fs = require("fs");
let ScreenShots = require("../imports/screenshots");
let currency = require("currency-formatter");

const ss = new ScreenShots();

/** Class representing Bitcoin. */
class Bitcoin {
  /**
   * description would be here.
   */
  constructor() {}

  /**
   * runs Bitcoin
   * @param {object} ctx - telegraf context object.
   */
  getBalance(ctx) {
    let address = ctx.match[1];
    let replyTo = ctx.update.message.message_id;

    let options = {
      method: "GET",
      url: "https://blockchain.info/address/" + address + "?format=json",
      headers: { "cache-control": "no-cache" }
    };

    request(options, function(error, response, body) {
      if (error) {
        console.log("debug", error);
      }
      let data = JSON.parse(body);
      let satoshis = data.final_balance;
      let bitcoin = data.final_balance / 100000000;

      if (error) {
        return ctx.reply(`${error} error`);
      } else {
        let text = `<i>Balance</i> \n${satoshis} <strong>satoshis</strong> \n${bitcoin} <strong> BTC </strong>\n\nView transactions: https://blockchain.info/address/${address}`;
        return ctx.replyWithHTML(`${text}`, { disable_notification: true });
      }
    });
  }

  getCoinbaseExchangeRate(ctx) {
    let options = {
      method: "GET",
      url: "https://api.coinbase.com/v2/exchange-rates?currency=BTC",
      headers: { "cache-control": "no-cache" }
    };

    request(options, function(error, response, body) {
      if (error) {
        console.log("debug", error);
      }
      let data = JSON.parse(body);
      let USD = data.data.rates.USD;

      if (error) {
        return ctx.reply(`${error} error`);
      } else {
        let text = `1 BTC = $ ${USD}`;
        return ctx.replyWithHTML(`${text}`, { disable_notification: true });
      }
    });
  }

  getBitcoinityChart(ctx) {
    let date = new Date()
      .toString()
      .split(" ")
      .splice(1, 3)
      .join(" ");
    let caption = `btc price as of ${date}`;

    return ss.createScreenshot(ctx, "http://bitcoinity.org/markets", caption);
  }

  convertToBitcoin(ctx) {
    let amount = ctx.match[1].replace(/\s+/, "");
    amount = Number(amount.replace(/[^0-9\.]+/g, ""));
    let fromCurrency = ctx.match[2].replace(/\s+/, "").toUpperCase();
    let to = ctx.match[4].replace(/\s+/, "").toUpperCase();

    switch (fromCurrency) {
      case "BCC":
        fromCurrency = "BCH";
        break;
    }
    switch (to) {
      case "BCC":
        to = "BCH";
        break;
    }

    let options = {
      method: "GET",
      url: "https://apiv2.bitcoinaverage.com/convert/global",
      qs: { from: fromCurrency, to: to, amount: amount },
      headers: { "cache-control": "no-cache" }
    };

    request(options, function(error, response, body) {
      if (response.statusCode == "200") {
        let data = JSON.parse(body);
        let price;

        if (fromCurrency == "BTC" || fromCurrency == "BCH") {
          price = currency.format(data.price, {
            symbol: "$",
            decimal: ".",
            thousand: ",",
            precision: 2,
            format: "%s%v"
          });
        } else {
          price = data.price;

          amount = currency.format(amount, {
            symbol: "$",
            decimal: ".",
            thousand: ",",
            precision: 2,
            format: "%s%v"
          });
        }

        return ctx.replyWithHTML(`${amount} ${fromCurrency} = ${price} ${to}`, {
          disable_notification: true
        });
      } else {
        return ctx.replyWithHTML(
          `usage: convert (amount) (currency) to (currency)`,
          {
            disable_notification: true
          }
        );
      }
    });
  }
}

module.exports = Bitcoin;
