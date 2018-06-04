import { SwaggerEntidadePropriedade } from "./SwaggerEntidadePropriedade";

export class SwaggerMethodDefinition {
    tags: string[];
    operationId: string
    consumes: string[];
    produces: string[];
    sumary: string;
    description: string;
    parameters?: SwaggerEntidadePropriedade[];
    responses: {
        [code: string]: SwaggerMethodDefinitionResponse
    }
}

class SwaggerMethodDefinitionResponse {
    description: string;
    schema: SwaggerEntidadePropriedade;
}