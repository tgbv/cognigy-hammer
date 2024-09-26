import { INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createNodeDescriptor, setNextNode } from "cognigy-hammer";

// auto-generated
// do not modify
const descriptor = createNodeDescriptor(__filename);

descriptor.defaultLabel = '{{ NODE_TYPE }} label';
descriptor.summary = '{{ NODE_TYPE }} summary';

descriptor.constraints = {
  placement: {},
  collapsable: true,
  creatable: {{ NODE_CONSTRAINT_CREATEABLE }},
  deletable: true,
  editable: true,
  movable: true,
};

descriptor.appearance = {
  color: "#61d188",
  textColor: "black",
  variant: "{{ NODE_APPEARANCE_VARIANT }}"
}

descriptor.fields = [
  // node fields
];

descriptor.function = async (funcParams: INodeFunctionBaseParams) => {
  const { childConfigs, cognigy, config, nodeId } = funcParams;

  // setNextNode( funcParams, ... );
};

export default descriptor;
{{#if isChildNode}}
export const {{ NODE_TYPE }}Node = descriptor;
{{/if}}

