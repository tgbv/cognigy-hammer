#!/usr/bin/env node

const cc = require("node-console-colors");
import { deleteNode } from "./com/delete";

(() => {
  console.log(cc.set('fg_yellow', `warning: ch.* commands will be deprecated in the next major release! Consider using cognigy-hammer * commands.`));

  return deleteNode();
})();
