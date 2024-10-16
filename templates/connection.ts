import type { IConnectionSchema } from "@cognigy/extension-tools"

export interface I{{CONNECTION_NAME}} {

}

const connection: IConnectionSchema = {
  type: '{{CONNECTION_NAME}}',
  label: '{{CONNECTION_NAME}} label here',
  fields: [

  ]
};

export default connection;
export const {{CONNECTION_NAME}} = connection;
