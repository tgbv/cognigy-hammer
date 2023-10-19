#!/usr/bin/env node

import prompts, { Choice } from "prompts";
const cc = require("node-console-colors");

import { cwdIsInExtensionProject, fileIsNode, scanDirForFiles } from "../lib";
import { rmSync } from "fs";
import { resolve } from "path";

(async () => {
  try {
    if(!cwdIsInExtensionProject()) {
      console.log(cc.set('fg_red', `info: You are not in a Cognigy extension project!`));
      process.exit(1);
    }
  
    const availableNodes = scanDirForFiles('./src/nodes')
      .filter(p => fileIsNode(p));
  
    const nonDirtyAvailableNodes = availableNodes        
      .map(p => p.replace(/.+\/nodes\//, ''))
      .map(p => p.replace(/\.[a-z]+$/, ''));
  
    const { index } = await prompts({
      type: 'select',
      name: 'index',
      choices: nonDirtyAvailableNodes.map<Choice>(n => ({ title: n })),
      message: "Pick a node you want to delete",
      }, { onCancel: () => process.exit() });
  
    const nodeToRemove = resolve(availableNodes[index]);
      
    const { confirmed } = await prompts({
      type: 'toggle',
      name: 'confirmed',
      message: cc.set('fg_yellow', `Are you sure you want to delete node ${nonDirtyAvailableNodes[index]} and its children?`),
      active: 'yes',
      inactive: 'no',
    }, { onCancel: () => process.exit() });
  
    if(confirmed) {
      const dirToRemove = nodeToRemove.replace(/\.[a-z]+$/, '');
  
      try {
        rmSync(nodeToRemove, { force: true, recursive: true })
        rmSync(dirToRemove, { force: true, recursive: true })
      } catch(_){}
  
      console.log(cc.set('fg_green', `info: Deleted node ${nonDirtyAvailableNodes[index]} and it's children!`));
    }
  } catch(e) {

  }
})();
