#!/usr/bin/env node

const cc = require("node-console-colors");
import { createNode } from "./com/create";

(async () => {
  console.log(cc.set('fg_yellow', `warning: ch.* commands will be deprecated in the next major release! Consider using cognigy-hammer * commands.`));

  return createNode();
})();
