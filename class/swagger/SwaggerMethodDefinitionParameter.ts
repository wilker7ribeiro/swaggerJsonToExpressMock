export class SwaggerMethodDefinitionParameter {
    "name": string;
    "in": string | "path";
    "required": boolean
    "type": string | "integer" | "string" | "boolean" | "array";  
    "format": string | "int64" | "date-time";
}