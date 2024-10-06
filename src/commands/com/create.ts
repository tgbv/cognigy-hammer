import prompts, { Choice } from "prompts";
import { cwdIsInExtensionProject, fileIsNode, scanDirForFiles, ucFirst } from "../../lib";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "fs";
import { basename, dirname, resolve } from "path";
const cc = require("node-console-colors");
import * as Handlebars from "handlebars";
import { INodeDescriptor } from "@cognigy/extension-tools";
import { INodeAppearance, INodeConstraints } from "@cognigy/extension-tools/build/interfaces/descriptor";
import { spawn } from "child_process";

/**
 * 
 */
export const createConnection = async () => {
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

    const connTemplate = Handlebars.compile<{ CONNECTION_NAME:string }>( readFileSync(`${__dirname}/../../../templates/connection.ts`).toString() );

    const filePathTarget = `./src/connections/${connName}.ts`;

    try {
      mkdirSync(dirname(filePathTarget), { recursive: true });
    } catch(_) {}

    writeFileSync(filePathTarget,  connTemplate({ CONNECTION_NAME: ucFirst(basename(connName)) }));

    console.log(cc.set('fg_green', `Connection '${connName}' has been created.`))

  } catch(e) {
    console.log(cc.set('fg_red', `error: ${e} | ${JSON.stringify(e)}`));
  }
}


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

/**
 * 
 */
export const createNode = async () => {
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

    const nodeTemplate = Handlebars.compile<TNodeTemplate>( readFileSync(`${__dirname}/../../../templates/node.ts`).toString() );

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
}

export const createScaffold = async () => {

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
      initial: PKG_NAME,
      validate: n => n ? true : 'Input string'
    }, { onCancel: () => process.exit() });

    const { PKG_KEYWORDS } = await prompts({
      type: 'list',
      name: 'PKG_KEYWORDS',
      initial: PKG_NAME,
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

    const { INIT_REPO } = await prompts({
      type: 'toggle',
      name: 'INIT_REPO',
      message: cc.set('fg_green', `Initialize GIT repo for extension?`),
      initial: true,
      active: 'yes',
      inactive: 'no',
    }, { onCancel: () => process.exit() });
    
    console.log(cc.set('fg_green', `info: Deleting ${WRITE_PATH} ...`));
    rmSync(WRITE_PATH, { recursive: true});

    console.log(cc.set('fg_green', `info: Creating scaffold in ${WRITE_PATH}...`));

    mkdirSync(WRITE_PATH);
    
    const projectScaffoldPath = `${ dirname(__filename) }/../../../templates/project`;
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

    if(INIT_REPO) {
      await new Promise<void>((accept) => spawn('git', ['init', '.'], {
        cwd: WRITE_PATH,
        detached: true,
        stdio: "inherit"
      }).on("exit", () => accept()));
    }

    await new Promise<void>((accept) => spawn('npm', ['i'], {
      cwd: WRITE_PATH,
      detached: true,
      stdio: "inherit"
    }).on("exit", () => accept()));

    console.log(cc.set('fg_green', `info: Done!`));

  } catch(e) {
    console.log(cc.set('fg_red', `error: ${JSON.stringify(e)} ${e}`));
  }

}
