export class SwaggerEntidadePropriedade {
    "type": string | SwaggerEntidadeType
    "format": string | "int64" | "date-time";
    "items": SwaggerEntidadePropriedade;
    "description": string;
    "$ref": string
    "name": string;
    "in": "path" | "body";
    "required": boolean
    "enum": string[];
    "schema": SwaggerEntidadePropriedade;
};

export enum SwaggerEntidadeType {
    INTEGER = "integer",
    NUMBER = "number",
    STRING = "string",
    BOOLEAN = "boolean",
    ARRAY = "array",
    FILE = "file"
}