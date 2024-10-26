import { INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { createNodeDescriptor, setNextNode } from "cognigy-hammer";

// auto-generated
// do not modify
const descriptor = createNodeDescriptor(__filename);

descriptor.defaultLabel = '{{ NODE_TYPE }} label';
descriptor.summary = '{{ NODE_TYPE }} summary';

descriptor.constraints = {
  placement: {},
  collapsable: {{ NODE_CONSTRAINT_COLLAPSABLE }},
  creatable: {{ NODE_CONSTRAINT_CREATEABLE }},
  deletable: {{ NODE_CONSTRAINT_DELETABLE }},
  editable: {{ NODE_CONSTRAINT_EDITABLE }},
  movable: {{ NODE_CONSTRAINT_MOVABLE }},
};

descriptor.appearance = {
  color: "{{ NODE_APPEARANCE_COLOR }}",
  textColor: "{{ NODE_APPEARANCE_TEXT_COLOR }}",
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

