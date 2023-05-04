import { Command } from "@commander-js/extra-typings";

import addDiscWebhook from "./addDiscWebhook.js";
import invitePerson from "./invitePerson.js";

const commands: Command[] = [addDiscWebhook, invitePerson];

export default commands;
