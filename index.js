let config = require('./config/config');
let winston = require('./middleware/winston');
let singleMiddleWareTest = require('./middleware/singleMiddleWareTest');
let complexMiddleWare = require('./middleware/complexMiddleWare');
let env = process.env.NODE_ENV || 'development';

const Telegraf = require('telegraf');
const bot = new Telegraf(config[`${env}`]['token']);

// middlewares
bot.use(Telegraf.memorySession());
bot.use(singleMiddleWareTest); // has a single function
bot.use(complexMiddleWare); // idea is to have multiple functions



bot.command('start', (ctx) => ctx.reply('Hey')) // type '/start'
bot.on('sticker', (ctx) => ctx.reply('👍')) // emojis work

// on any text message, increments session.counter
// as much logic should be moved to outside middleware as possible.
// this is just for learning / example.
bot.on('text', (ctx) => {
  winston.log('debug', ctx.session);
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
    return ctx.reply(`Message counter:${ctx.session.counter}`)
})



bot.catch((err) =>{
    winston.log('error',  err);
})

bot.startPolling()