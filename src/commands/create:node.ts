#!/usr/bin/env node

import { basename, dirname, resolve } from "path";
import { existsSync, readFileSync, writeFileSync, statSync, mkdirSync} from "fs";
const cc = require("node-console-colors");
import prompts, { Choice } from "prompts";
import Handlebars from "handlebars";
import { INodeDescriptor } from "@cognigy/extension-tools";
import { INodeAppearance, INodeConstraints } from "@cognigy/extension-tools/build/interfaces/descriptor";
import { cwdIsInExtensionProject, fileIsNode, scanDirForFiles } from "../lib";

type TNodeTemplate = {
  NODE_TYPE: INodeDescriptor["type"],
  NODE_CONSTRAINT_CREATEABLE: INodeConstraints["creatable"],
  NODE_APPEARANCE_VARIANT: INodeAppearance["variant"],
  isChildNode?: boolean
}

function nodeExists(nodeName: string): boolean {
  if(existsSync(`./src/nodes/${nodeName}.ts`)) {
    return true;
  }

  return false;
}

(async () => {

  try {

    if(!cwdIsInExtensionProject()) {
      console.log(cc.set('fg_red', `info: You are not in a Cognigy extension project!`));
      process.exit(1);
    }

    const { nodeName } = await prompts({
      type: 'text',
      name: 'nodeName', 
      message: "Input node name",
      validate: t => {
        if(!t) {
          return 'Input string'
        }

        return true;
      },
    }, { onCancel: () => process.exit() });

    const nodeTemplate = Handlebars.compile<TNodeTemplate>( readFileSync(`${__dirname}/../../templates/node.ts`).toString() );

    const { nodeHasParent } = await prompts({
      type: 'toggle',
      name: 'nodeHasParent',
      message: "Does node have parent?",
      active: 'yes',
      inactive: 'no',
    }, { onCancel: () => process.exit() });

    if(nodeHasParent) {
      const nodeNameNaked = basename(nodeName);

      const availableNodes = scanDirForFiles('./src/nodes')
          .filter(p => fileIsNode(p))
          .map(p => p.replace(/.+\/nodes\//, ''))
          .map(p => p.replace(/\.[a-z]+$/, ''));

      const { parentNodeIndex } = await prompts({
        type: 'select',
        name: 'parentNodeIndex',
        choices: availableNodes.map<Choice>(n => ({ title: n })),
        message: "Pick a parent node",
      }, { onCancel: () => process.exit() });

      const parentNode = availableNodes[parentNodeIndex];

      // create dir with parent node if not already exists
      const tPath = `./src/nodes/${parentNode}`;
      if(!existsSync(tPath) || !statSync(tPath).isDirectory()) {
        mkdirSync(tPath);
      }

      if(nodeExists(`${parentNode}/${nodeNameNaked}`)) {
        console.log(cc.set('fg_red', `Node '${nodeNameNaked}' already exists as child for '${parentNode}' !`));
        process.exit(1);
      }

      // create child node
      const finalNodeSourceCode = nodeTemplate({ 
        NODE_TYPE: nodeNameNaked,
        NODE_CONSTRAINT_CREATEABLE: false,
        NODE_APPEARANCE_VARIANT: 'mini',
        isChildNode: true
      });
      writeFileSync(`${tPath}/${nodeNameNaked}.ts`, finalNodeSourceCode);
      console.log(cc.set('fg_green', `Node '${tPath}/${nodeNameNaked}.ts' has been created.`));

      process.exit();
    }

    if(nodeExists(nodeName)) {
      console.log(cc.set('fg_red', `Node ${nodeName} already exists!`));
      process.exit(1);
    }

    const finalNodeSourceCode = nodeTemplate({ 
      NODE_TYPE: nodeName,
      NODE_APPEARANCE_VARIANT: 'regular',
      NODE_CONSTRAINT_CREATEABLE: true,
    });

    const targetPath = `./src/nodes/${nodeName}.ts`;
    try {
      mkdirSync(dirname(targetPath), { recursive: true });
    } catch(_) {}
    writeFileSync(targetPath, finalNodeSourceCode);

    console.log(cc.set('fg_green', `Node ${nodeName} has been created.`))

  } catch(e) {
    console.log(cc.set('fg_red', `error: ${e} | ${JSON.stringify(e)}`));
  }

})();
