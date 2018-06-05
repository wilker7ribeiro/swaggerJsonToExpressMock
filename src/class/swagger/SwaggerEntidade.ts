import { SwaggerEntidadePropriedade } from "./SwaggerEntidadePropriedade";

export class SwaggerEntidade {
    "type": string | "object";
    "properties": {
        [key: string]: SwaggerEntidadePropriedade
    };
}