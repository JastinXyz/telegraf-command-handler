# Telegraf Command Handler

A command handler for [Telegraf](https://npmjs.com/telegraf), which is similar to the command handler for Discord.js and such. The goal is that all commands are not in 1 file... But divided into several different files.

## Installation

```bash
npm i telegraf-command-handler
# or
yarn add telegraf-command-handler
# or
pnpm add telegraf-command-handler
```

## Usage

```js
/* main file */
const { Telegraf } = require('telegraf');
const { TelegramCommandHandler } = require('telegraf-command-handler');
const path = require('path');

const bot = new Telegraf('Your bot token');

const CommandHandler = new TelegramCommandHandler({
    path: path.resolve() + "/path/to/dir",
});

bot.use(CommandHandler.load());

// ...bot.launch()
```

```js
/* command file */
module.exports = {
    name: "start",
    async execute(ctx) {
        ctx.reply("hello world");
    }
}
```

## Constructor Options

```ts
interface Options {
    /* path to your command directory */
    path: string;
    /* a function that executed when error comes from your command file */
    errorHandling: (ctx: Context, error: any) => any | undefined;
}
```

## Command Example

```js
module.exports = {
    /* command name (it will executed like /echo) */
    name: "echo",
    /* optional command aliases (can be string or Array<string>) */
    aliases: ["say"],
    /* command code */
    async execute(ctx, args) {
        ctx.reply(args.join(" "))
    }
}
```