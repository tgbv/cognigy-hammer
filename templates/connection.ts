import type { IConnectionSchema } from "@cognigy/extension-tools"

export interface I{{CONNECTION_NAME}} extends IConnectionSchema {

}

export default {
  type: '{{CONNECTION_NAME}}',
  label: '{{CONNECTION_NAME}} label here',
  fields: [

  ]
} as I{{CONNECTION_NAME}};
