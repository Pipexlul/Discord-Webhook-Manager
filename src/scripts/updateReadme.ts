import fs from "fs";
import path from "path";

import { version } from "../lib/version.js";

const readmeText = `# Github Bulk Actions

Helper CLI tool that will allow you to easily manage github functionality in a single command that would otherwise require a lot of repetition.

## IN DEVELOPMENT

Current version: ${version}

## Commands

- add-discord-webhook
- invite-person
`;

const filePath = path.join(process.cwd(), "README.md");

fs.writeFileSync(filePath, readmeText);
