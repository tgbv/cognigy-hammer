import { dirname } from 'path';
import { createExtension } from '@cognigy/extension-tools/build';
import { getConnections, getNodeDescriptors } from 'cognigy-hammer';

// auto-generated
// do not modify
export default createExtension({
  nodes: getNodeDescriptors(dirname(__filename)),
  connections: getConnections(dirname(__filename)),
});
