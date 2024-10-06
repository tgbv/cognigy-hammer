#!/usr/bin/env node

import { createScaffold } from "./com/create";
const cc = require("node-console-colors");

(async () => {
  console.log(cc.set('fg_yellow', `warning: ch.* commands will be deprecated in the next major release! Consider using cognigy-hammer * commands.`));
  
  return createScaffold();
})();
