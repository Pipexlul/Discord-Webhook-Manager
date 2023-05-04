import { Command } from "@commander-js/extra-typings";
import inquirer from "inquirer";

const updateRepos = new Command("update-repos")
  .option(
    "-f, --force",
    "Don't ask for confirmation of repositories names that match the regex."
  )
  .action(async (options, command) => {
    const { force } = options;

    const promptGHToken = await inquirer.prompt({
      type: "input",
      name: "ghToken",
      message: "Please input your Github Personal Access Token",
    });

    const promptRepoNameRegex = await inquirer.prompt({
      type: "input",
      name: "repoNameRegex",
      message:
        "Please input your repositories name regex (leave blank to include all repositories)",
    });

    console.log(`Github Personal Access Token: ${promptGHToken.ghToken}`);
    console.log(
      `Repositories name regex: ${promptRepoNameRegex.repoNameRegex}`
    );
  });

export default updateRepos;
