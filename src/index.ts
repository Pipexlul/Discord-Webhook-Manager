import figlet from "figlet";
import { Command } from "@commander-js/extra-typings";

import commands from "./commands/index.js";

const main = async () => {
  console.log(figlet.textSync("Github Bulk Actions"));

  const program = new Command()
    .version("0.3.0")
    .description("CLI to help with Github processes that require repetition.");

  commands.forEach((command) => {
    program.addCommand(command);
  });

  program.parseAsync();
};

main();
