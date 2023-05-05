import figlet from "figlet";
import { Command } from "@commander-js/extra-typings";

import { version } from "./lib/version.js";
import commands from "./commands/index.js";

const main = async () => {
  console.log(figlet.textSync("Github Bulk Actions"));

  const program = new Command()
    .version(version)
    .description("CLI to help with Github processes that require repetition.");

  commands.forEach((command) => {
    program.addCommand(command);
  });

  program.parseAsync();
};

main();
