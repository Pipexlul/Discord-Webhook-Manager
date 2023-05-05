import { Octokit } from "octokit";
import { Command } from "@commander-js/extra-typings";
import inquirer from "inquirer";

import { delay } from "../utils/timingUtils.js";

const DELAY_MS = 2000;

const addDiscWebhook = new Command("add-discord-webhook")
  .description("Add a discord webhook to your repositories based on a regex")
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

    const regex = promptRepoNameRegex.repoNameRegex
      ? new RegExp(promptRepoNameRegex.repoNameRegex)
      : null;

    const promptDiscordWebhook = await inquirer.prompt({
      type: "input",
      name: "discordWebhook",
      message: "Please input your discord webhook url as given by Discord",
    });

    const webhookURL = `${promptDiscordWebhook.discordWebhook}/github`;

    const octokit = new Octokit({
      auth: promptGHToken.ghToken,
    });

    try {
      const validRepos: string[] = [];
      for await (const response of octokit.paginate.iterator(
        octokit.rest.repos.listForAuthenticatedUser,
        {
          type: "owner",
          sort: "full_name",
        }
      )) {
        response.data.forEach((repo) => {
          if (!regex || (regex && repo.name.match(regex))) {
            validRepos.push(repo.name);
          }
        });
      }

      if (!force) {
        console.warn(validRepos);

        const promptConfirmation = await inquirer.prompt({
          type: "confirm",
          name: "confirmation",
          message:
            "A webhook will be created for the repositories mentioned above. Continue?",
        });

        if (!promptConfirmation.confirmation) {
          process.exit(0);
        }
      }

      const {
        data: { login: username },
      } = await octokit.rest.users.getAuthenticated();

      for (const validRepo of validRepos) {
        let webhookExists: boolean = false;

        for await (const hookResponse of octokit.paginate.iterator(
          octokit.rest.repos.listWebhooks,
          {
            owner: username,
            repo: validRepo,
          }
        )) {
          if (
            hookResponse.data.some((hook) => hook.config.url === webhookURL)
          ) {
            console.log(
              `Discord webhook ${webhookURL} already exists for repository ${validRepo}. Skipping.`
            );
            webhookExists = true;
            break;
          }
        }

        if (webhookExists) {
          await delay(DELAY_MS);
          continue;
        }

        const response = await octokit.rest.repos.createWebhook({
          owner: username,
          repo: validRepo,
          events: ["*"],
          active: true,
          config: {
            content_type: "json",
            url: webhookURL,
          },
        });

        console.log(
          `Webhook created: id (${response.data.id}) in repository ${validRepo}`
        );

        await delay(DELAY_MS);
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

export default addDiscWebhook;
