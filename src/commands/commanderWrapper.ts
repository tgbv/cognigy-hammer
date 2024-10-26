#!/usr/bin/env node

import { Argument, Command } from "commander";
import { readFileSync } from "fs";
import { createConnection, createNode, createScaffold } from "./com/create";
import { deleteConnection, deleteNode } from "./com/delete";
import { listConnections, listNodes } from "./com/list";

const packageJson = JSON.parse(readFileSync(`${__dirname}/../../package.json`).toString());

const program = new Command();

program
  .name(packageJson.name)
  .version(packageJson.version)
  .description(packageJson.description);

const entityArg = new Argument('<entity>', 'Entity type.')
  .choices(['connection', 'conn', 'node', 'scaffold', 'project']);

program
  .command('list')
  .description('List current nodes / connections.')
  .addArgument(new Argument('<entity>', 'Entity type.').choices(['connections', 'conns', 'nodes']))
  .action((entity: string) => {
    switch(entity) {
      case 'nodes': return listNodes();
      case 'connections': 
      case 'conns': return listConnections();
    }
  });

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
      case 'connection': 
      case 'conn': return deleteConnection();
    }
  });

program.parse();
