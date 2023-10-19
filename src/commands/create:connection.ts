#!/usr/bin/env node

import prompts from "prompts";
import Handlebars from "handlebars";
const cc = require("node-console-colors");
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { basename, dirname } from "path";
import { cwdIsInExtensionProject } from "../lib";

function ucFirst(input: string): string {
  return input[0].toUpperCase() + input.slice(1);
}

(async () => {
  try {
    if(!cwdIsInExtensionProject()) {
      console.log(cc.set('fg_red', `info: You are not in a Cognigy extension project!`));
      process.exit(1);
    }

    const { connName } = await prompts({
      type: 'text',
      name: 'connName', 
      message: "Input connection name",
      validate: c => existsSync(`./src/connections/${c}.ts`) ? `Connection '${c} already exists!` : true,
    }, { onCancel: () => process.exit() });

    const connTemplate = Handlebars.compile<{ CONNECTION_NAME:string }>( readFileSync(`${__dirname}/../../templates/connection.ts`).toString() );

    const filePathTarget = `./src/connections/${connName}.ts`;

    try {
      mkdirSync(dirname(filePathTarget), { recursive: true });
    } catch(_) {}

    writeFileSync(filePathTarget,  connTemplate({ CONNECTION_NAME: ucFirst(basename(connName)) }));

    console.log(cc.set('fg_green', `Connection '${connName}' has been created.`))

  } catch(e) {
    console.log(cc.set('fg_red', `error: ${e} | ${JSON.stringify(e)}`));
  }

})();
