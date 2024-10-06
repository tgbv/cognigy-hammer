#!/usr/bin/env node

import { createConnection } from "./com/create";
const cc = require("node-console-colors");

(() => {
  console.log(cc.set('fg_yellow', `warning: ch.* commands will be deprecated in the next major release! Consider using cognigy-hammer * commands.`));

  return createConnection();
})();
