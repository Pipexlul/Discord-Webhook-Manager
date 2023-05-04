import figlet from "figlet";
import { Command } from "@commander-js/extra-typings";

import commands from "./commands/index.js";

const main = async () => {
  console.log(figlet.textSync("Discord Webhook Manager"));

  const program = new Command()
    .version("0.2.0")
    .description("Helper to register discord webhooks on different services");

  commands.forEach((command) => {
    program.addCommand(command);
  });

  program.parseAsync();
};

main();
