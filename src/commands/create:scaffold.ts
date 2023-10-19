#!/usr/bin/env node

import { cpSync, readdirSync, existsSync, mkdirSync, statSync, rmSync, readFileSync, writeFileSync, renameSync} from "fs";
import { spawn } from "child_process";
import Handlebars from "handlebars";
import path, { dirname, resolve } from "path";
const cc = require("node-console-colors");
const prompts = require('prompts');

(async () => {

  try {

    let { WRITE_PATH } = await prompts({
      type: 'text',
      name: 'WRITE_PATH',
      message: cc.set('fg_green', `Location`),
      initial: '.',
    }, { onCancel: () => process.exit() });

    WRITE_PATH = resolve(WRITE_PATH);

    if(
      !existsSync(WRITE_PATH) || 
      (existsSync(WRITE_PATH) && !statSync(WRITE_PATH).isDirectory())
    ) {
      mkdirSync(WRITE_PATH);
    }
    
    if(readdirSync(WRITE_PATH).length > 0) {
      const result = await prompts({
        type: 'toggle',
        name: 'overwrite',
        message: cc.set('fg_yellow', `Location ${WRITE_PATH} is not empty! overwrite it?`),
        active: 'yes',
        inactive: 'no',
      }, { onCancel: () => process.exit() });
    
      if(!result.overwrite) {
        console.log(cc.set('fg_green', `info: Skipped location ${WRITE_PATH}`));
        process.exit(0);
      }
    }

    const { PKG_NAME } = await prompts({
      type: 'text',
      name: 'PKG_NAME',
      message: cc.set('fg_green', `Extension name`),
      validate: n => n ? true : 'Input string'
    }, { onCancel: () => process.exit() });

    const { PKG_VERSION } = await prompts({
      type: 'text',
      name: 'PKG_VERSION',
      message: cc.set('fg_green', `Extension version`),
      validate: (n: string) => n.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) ? true : 'Input valid version',
      initial: '1.0.0'
    }, { onCancel: () => process.exit() });

    const { PKG_DESCRIPTION } = await prompts({
      type: 'text',
      name: 'PKG_DESCRIPTION',
      message: cc.set('fg_green', `Extension description`),
      validate: n => n ? true : 'Input string'
    }, { onCancel: () => process.exit() });

    const { PKG_KEYWORDS } = await prompts({
      type: 'list',
      name: 'PKG_KEYWORDS',
      message: cc.set('fg_green', `Extension keywords`),
    }, { onCancel: () => process.exit() });

    const { PKG_AUTHOR } = await prompts({
      type: 'list',
      name: 'PKG_AUTHOR',
      message: cc.set('fg_green', `Extension author`),
      initial: process.env.HOSTNAME
    }, { onCancel: () => process.exit() });

    const { PKG_LICENSE } = await prompts({
      type: 'list',
      name: 'PKG_LICENSE',
      message: cc.set('fg_green', `Extension license`),
      initial: 'UNLICENSED'
    }, { onCancel: () => process.exit() });
    
    console.log(cc.set('fg_green', `info: Deleting ${WRITE_PATH} ...`));
    rmSync(WRITE_PATH, { recursive: true});

    console.log(cc.set('fg_green', `info: Creating scaffold in ${WRITE_PATH}...`));

    mkdirSync(WRITE_PATH);
    
    const projectScaffoldPath = `${ dirname(__filename) }/../../templates/project`;
    cpSync(projectScaffoldPath, WRITE_PATH, { recursive: true, force: true });

    mkdirSync(resolve(WRITE_PATH, 'src', 'nodes'))
    mkdirSync(resolve(WRITE_PATH, 'src', 'assets'))
    mkdirSync(resolve(WRITE_PATH, 'src', 'connections'))

    renameSync(resolve(WRITE_PATH, '.gitignore.template'), resolve(WRITE_PATH, '.gitignore'));

    const pkgTemplate = Handlebars.compile(readFileSync(`${projectScaffoldPath}/package.json`).toString())
    writeFileSync(
      `${WRITE_PATH}/package.json`,

      pkgTemplate({
        PKG_NAME,
        PKG_VERSION,
        PKG_DESCRIPTION,
        PKG_KEYWORDS: PKG_KEYWORDS.map(s => (`"${s}"`)).join(', '),
        PKG_AUTHOR,
        PKG_LICENSE
      })
    )

    await new Promise<void>((accept) => spawn('git', ['init', '.'], {
      cwd: WRITE_PATH,
      detached: true,
      stdio: "inherit"
    }).on("exit", () => accept()));

    await new Promise<void>((accept) => spawn('npm', ['i'], {
      cwd: WRITE_PATH,
      detached: true,
      stdio: "inherit"
    }).on("exit", () => accept()));

    console.log(cc.set('fg_green', `info: Done!`));

  } catch(e) {
    console.log(cc.set('fg_red', `error: ${JSON.stringify(e)} ${e}`));
  }

})();
