import { fileIsNode, scanDirForFiles } from "../../lib";

export const listNodes = async () => {
  const availableNodes = scanDirForFiles('./src/nodes')
    .filter(p => fileIsNode(p))
    .map(p => p.replace(/.+\/nodes\//, ''))
    .map(p => p.replace(/.+\\nodes\\/, ''))
    .map(p => p.replace(/\.[a-z]+$/, ''))

  console.log(availableNodes);
}

export const listConnections = async () => {
  const availableConns = scanDirForFiles('./src/connections')
    .map(p => p.replace(/.+\/connections\//, ''))
    .map(p => p.replace(/.+\\connections\\/, ''))
    .map(p => p.replace(/\.[a-z]+$/, ''));

  console.log(availableConns);
}