import { Composer, Context, MiddlewareFn } from "telegraf";
import fs, { Stats } from "fs";
import path from "node:path";
import { Update } from "telegraf/typings/core/types/typegram";

interface Options {
  path: string;
  errorHandling?: (ctx: Context, error: any) => any | undefined;
}

class TelegrafCommandHandler {
  path: string;
  errorHandling?: (ctx: Context, error: any) => any | undefined;
  commands: Map<string, any>;

  constructor(opts: Options) {
    if (!opts.path)
      throw new Error("[telegraf-command-handler] Path required!");
    if (opts.errorHandling && typeof opts.errorHandling !== "function")
      throw new Error(
        '[telegraf-command-handler] "errorHandling" must be a function!'
      );

    this.path = opts.path;
    this.errorHandling = opts.errorHandling;
    this.commands = new Map();

    this.walk(this.path, (x) => {
      let cmdObj = require(x);
      this.commands.set(cmdObj.name, cmdObj);
      console.log(`[telegraf-command-handler] Loaded - ${cmdObj.name}`);
    });
  }

  load(): MiddlewareFn<Context<Update>> {
    return Composer.on(["edited_message", "message"], async (ctx, next) => {
      let message = ctx.editedMessage ?? ctx.message as any;
      let text = message.text ?? message.caption;

      if (message.from.is_bot) return;

      let commands = Array.from(this.commands.values());
      let args = text.slice(1).split(/\s+/);
      let command = args.shift().toLowerCase();
      let commandData = commands.find(
        (c) =>
          c.name.toLowerCase() === command.toLowerCase() ||
          (c.aliases && typeof c.aliases === "object"
            ? c.aliases.includes(command.toLowerCase())
            : c.aliases === command.toLowerCase())
      );

      if (!commandData) return;
      try {
        await commandData.execute(ctx, args);
      } catch (error) {
        console.error(`Error executing ${command}`);
        console.error(error);
        if(this.errorHandling) this.errorHandling(ctx, error);
      }

      return next();
    });
  }

  walk(
    dir: string,
    callback: (filepath: string, file: string, stats: Stats) => any
  ) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      var filepath = path.join(dir, file);
      const stats = fs.statSync(filepath);
      if (stats.isDirectory()) {
        module.exports.walk(filepath, callback);
      } else if (stats.isFile()) {
        callback(filepath, file, stats);
      }
    });
  }
}

export { TelegrafCommandHandler };
