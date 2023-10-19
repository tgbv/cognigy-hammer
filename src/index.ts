import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync,  } from "fs";
import { resolve, parse  } from "path";

import { IConnectionSchema, INodeDescriptor } from '@cognigy/extension-tools/build';
import { INodeFunctionBaseParams } from "@cognigy/extension-tools/build/interfaces/descriptor";
import { createNodeDescriptor as cCreateNodeDescriptor } from "@cognigy/extension-tools";

import isTsNode from "detect-ts-node";

import { fileIsNode, scanDirForFiles } from "./lib";

type TExtensionMapNodes = {
  [nodeType: string]: {
    childrenType: string[]
    parentType?: string;
  }
}

type TExtensionMap = {
  connections: string[],
  nodes: TExtensionMapNodes
}

export interface ISetNextNodeFuncParams extends INodeFunctionBaseParams {
  targetNode?: INodeDescriptor,
};

export interface IHammerNodeDescriptor extends INodeDescriptor {
  nodePath: string
}

/**
 * 
 * @param nodesMap 
 * @param parentNodeType 
 * @param dirToScan 
 * @returns 
 */
function recursivelyMapNodesForExtensionMap(
  nodesMap: TExtensionMapNodes, 
  parentNodeType: string | undefined, 
  dirToScan: string
) {

  if(!existsSync(dirToScan)) {
    return;
  }

  const entities =  readdirSync(dirToScan, { withFileTypes: true, recursive: false })
                    .sort((a, b) => a.path.length > b.path.length ? 1 : 0);

  for (const n of entities) {
    const nodeType = `${n.path}/${n.name}`.replace(/.+\/nodes\//, '').replace(/\.[a-z]+$/, '');

    if(n.isFile() && fileIsNode(resolve(n.path, n.name))) {
      nodesMap[nodeType] = {
        childrenType: [],
        parentType: parentNodeType
      }

      // set child to parent
      if(parentNodeType && nodesMap[parentNodeType]) {
        nodesMap[parentNodeType].childrenType.push(nodeType)
      }

      // scan for additional child nodes
      const nextPathToScan = resolve(n.path, parse(n.name).name);
      if( existsSync(nextPathToScan) &&  statSync(nextPathToScan).isDirectory() ) {
        recursivelyMapNodesForExtensionMap( nodesMap, nodeType, resolve(nextPathToScan) );
      }
    } else if(n.isDirectory() && !nodesMap[n.name]) {
      recursivelyMapNodesForExtensionMap( nodesMap, nodeType, resolve(n.path, n.name) );
    }
  };
}

function generateExtensionMap(rootPath: string = require.main?.path || ''): void {
  const connections = scanDirForFiles(resolve(rootPath, 'connections'))
  // .filter(p => {
  //   const { type, label, fields } = require(p).default;

  //   return type && label && fields;
  // })
  .map(p => p.replace(/.+\/connections\//, ''))
  .map(p => p.replace(/\.[a-z]+$/, ''));

  const nodes = {};
  recursivelyMapNodesForExtensionMap(nodes, undefined, resolve(rootPath, 'nodes'));

  try {
    mkdirSync(resolve(rootPath, 'assets'), { recursive: true });
  } catch(_) {}

  writeFileSync(
    resolve(rootPath, 'assets', 'extension-map.js'), 
`// auto-generated
// do not edit
module.exports = {
  connections: ${JSON.stringify(connections, null, 2)},
  nodes: ${JSON.stringify(nodes, null, 2)},
}`
  );
}

function getExtensionMap(baseDir: string): TExtensionMap {
  const pathToMap = resolve(baseDir, 'assets','extension-map.js');

  if(!existsSync(pathToMap)) {
    generateExtensionMap(baseDir);
  }

  delete require.cache[pathToMap];

  return require(pathToMap);
}

/**
 * @returns Mapped node descriptors. If the map is broken, it will be regenerated automatically.
 */
export function getNodeDescriptors (baseDir: string): INodeDescriptor[] {
  try {
    return Object.keys(getExtensionMap(baseDir).nodes)
      .map(f => require(resolve(baseDir, 'nodes', `${f}.${isTsNode ? 'ts' : 'js'}`)).default)
      .filter(o => o.type && o.nodePath)
      .map(o => {
        delete o.nodePath;
        return o;
      });
  } catch(e) {
    generateExtensionMap(baseDir);
    return getNodeDescriptors(baseDir);
  }
}

/**
 * @returns Mapped connections. If the map is broken, it will be regenerated automatically.
 */
export function getConnections (baseDir: string): IConnectionSchema[] {
  try {
    return getExtensionMap(baseDir).connections
    .map(c => require(resolve(baseDir, 'connections', `${c}.${isTsNode ? 'ts' : 'js'}`)).default)
    .filter(o => o.type && o.label && o.fields);
  } catch(e) {
    generateExtensionMap(baseDir);
    return getConnections(baseDir);
  }
}

/**
 * Set next node in path execution queue.
 * 
 * @param options 
 * @param targetNode Must be a node descriptor.
 * @throws Error when target node is undefined/not found.
 */
export function setNextNode(options: ISetNextNodeFuncParams, targetNode?: INodeDescriptor ): void {
  const { cognigy, childConfigs } = options;

  if(options.targetNode) {
    targetNode = options.targetNode
  }

  if(!targetNode) {
    throw new Error('Provide targetNode as parameter!');
  }

  const targetNodeConfig = childConfigs.find((n) => n.type === targetNode?.type)
  if(targetNodeConfig) {
    cognigy.api.setNextNode?.(targetNodeConfig.id);
  } else {
    throw new Error('targetNodeConfig not found! Ensure node is properly created in Cognigy Chart and its type is correctly passed to setNextNode function.')
  }
}

/**
 * Automatically binds the dependencies of a descriptor.
 * 
 * First level nodes located in the directory present at the same level with the node
 * are considered children nodes.
 * 
 * @param nodeDescriptor 
 */
function injectDescriptorDependencies(nodeDescriptor: IHammerNodeDescriptor): void {

  // subtract nodeType
  const match = nodeDescriptor.nodePath.match(/nodes\/([\s\S]+)\./)
  const nodeType = (match && match[1]) ? match[1] : false;
  if(!nodeType) {
    throw new Error(`Could not detect nodeType from descriptor: ${JSON.stringify(nodeDescriptor)}`);
  }
  
  // assign node type
  nodeDescriptor.type = nodeType;

  // fetch the extension map
  let extensionMap: TExtensionMap = {
    nodes: {},
    connections: []
  };
  const baseDir = resolve(nodeDescriptor.nodePath.replace(nodeType, ''), '..', '..');
  try {
    extensionMap = getExtensionMap( baseDir );    
  } catch(e) {
    generateExtensionMap(baseDir);
    extensionMap = getExtensionMap(baseDir);
  }
  
  // bind dependencies
  for(const nodeTypeMap in extensionMap.nodes) {
    if(nodeTypeMap === nodeType) {
      const { childrenType, parentType } = extensionMap.nodes[nodeTypeMap];
      nodeDescriptor.parentType = parentType;
      nodeDescriptor.dependencies = {
        children: childrenType
      }
    }
  }
}

/**
 * Override of \@cognigy/extension-tools::createNodeDescriptor() which sets
 * the dependencies of node automatically based on extension-map.json
 * 
 * @param nodePath Path of node for which descriptor is created.
 * @returns Newly created node descriptor.
 */
export function createNodeDescriptor(nodePath: string): INodeDescriptor {
  const descriptor = cCreateNodeDescriptor({}) as IHammerNodeDescriptor;
  descriptor.nodePath = nodePath;
  
  injectDescriptorDependencies(descriptor);

  return descriptor;
}
