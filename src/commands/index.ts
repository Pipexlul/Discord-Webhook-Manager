import { Command } from "@commander-js/extra-typings";

import updateRepos from "./updateRepositories.js";
import devHelp from "./devHelp.js";

const commands: Command[] = [updateRepos, devHelp];

export default commands;
