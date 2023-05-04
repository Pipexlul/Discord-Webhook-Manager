import { Octokit } from "octokit";
import { Command } from "@commander-js/extra-typings";
import type { components } from "@octokit/openapi-types";

import data from "../sensitive-data/gh-token.json" assert { type: "json" };

const DevTest = new Command("dev-test").action(async (options, command) => {
  const octokit = new Octokit({
    auth: data.token,
  });

  const regex = new RegExp(data.regex);
  const validRepos: components["schemas"]["repository"][] = [];

  try {
    for await (const response of octokit.paginate.iterator(
      octokit.rest.repos.listForAuthenticatedUser,
      {
        type: "owner",
        sort: "full_name",
      }
    )) {
      response.data.forEach((repo) => {
        if (repo.name.match(regex)) {
          validRepos.push(repo);
        }
      });

      const repoNames = validRepos.map((repo) => repo.name);
      console.log(repoNames);
    }
  } catch (error) {}
});

export default DevTest;
