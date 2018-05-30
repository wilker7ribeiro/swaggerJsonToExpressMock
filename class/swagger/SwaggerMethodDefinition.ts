import { SwaggerMethodDefinitionParameter } from "./SwaggerMethodDefinitionParameter";

export class SwaggerMethodDefinition {
    "tags": string[];
    "operationId": string
    "consumes": string[];
    "produces": string[];
    "parameters": SwaggerMethodDefinitionParameter[];
    "responses": any[]
}