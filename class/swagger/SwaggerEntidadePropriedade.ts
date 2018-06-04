export class SwaggerEntidadePropriedade {
    "type": string | "integer" | "number" | "string" | "boolean" | "array" | "file";  
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
