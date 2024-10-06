#!/usr/bin/env node

import { Argument, Command } from "commander";
import { readFileSync } from "fs";
import { createConnection, createNode, createScaffold } from "./com/create";
import { deleteNode } from "./com/delete";

const packageJson = JSON.parse(readFileSync(`${__dirname}/../../package.json`).toString());

const program = new Command();

program
  .name(packageJson.name)
  .version(packageJson.version)
  .description(packageJson.description);

const entityArg = new Argument('<entity>', 'Entity type.')
  .choices(['connection', 'conn', 'node', 'scaffold', 'project']);

program
  .command('create')
  .description('Guided way to create a new entity.')
  .addArgument(entityArg)
  .action((entity: string) => {
    switch(entity) {
      case 'connection':
      case 'conn': return createConnection();

      case 'node': return createNode();

      case 'project':
      case 'scaffold': return createScaffold();
    }
  });

program
  .command('delete')
  .description('Guided way to delete an existing entity.')
  .argument('<entity>', 'Entity type to remove.')
  .action((entity: string) => {
    switch(entity) {
      case 'node': return deleteNode();
    }
  });

program.parse();
