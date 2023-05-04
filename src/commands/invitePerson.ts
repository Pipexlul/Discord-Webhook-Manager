import { Octokit } from "octokit";
import { Command } from "@commander-js/extra-typings";
import inquirer from "inquirer";

import { delay } from "../utils/timingUtils.js";

const invitePerson = new Command("invite-person")
  .description("Invite a person to multiple repositories based on a regex.")
  .option("-f, --force", "Don't ask for confirmation of repository names.")
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
      message: "Please input your repositories name regex",
    });

    const regex = promptRepoNameRegex.repoNameRegex
      ? new RegExp(promptRepoNameRegex.repoNameRegex)
      : null;

    const inviteePrompt = await inquirer.prompt({
      type: "input",
      name: "invitee",
      message: "Please input the username of the person you want to invite",
    });

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

      let printedRepos: boolean = false;
      if (validRepos.length > 10) {
        console.warn(
          "More than 10 repositories matched your regex. The invitations will only be sent from the first 10 repositories, listed below."
        );
        validRepos.splice(10);
        console.warn(validRepos);
        printedRepos = true;
      }

      if (!force) {
        if (!printedRepos) {
          console.warn(validRepos);
        }

        const confirmPrompt = await inquirer.prompt({
          type: "confirm",
          name: "confirmRepos",
          message:
            "Do you want to send the invitations to the repositories mentioned above?",
        });

        if (!confirmPrompt.confirmRepos) {
          process.exit(0);
        }
      }

      const {
        data: { login: owner_username },
      } = await octokit.rest.users.getAuthenticated();

      const invitee_username = inviteePrompt.invitee;

      for (const repoName of validRepos) {
        const response = await octokit.rest.repos.addCollaborator({
          owner: owner_username,
          repo: repoName,
          username: invitee_username,
        });

        console.log(
          `Invitation sent to ${inviteePrompt.invitee} to join repository ${repoName}`
        );

        await delay(2000);
      }
    } catch (error) {
      console.error(error);
    }
  });

export default invitePerson;
