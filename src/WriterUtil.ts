import { APIDefinition } from "./class/ApiDefinition";
import { PathParam, PathParamTipo } from "./class/PathParam";
import { Schema, TipoPropriedade } from "./class/Schema";


export class WriterUtil {
    static adicionarNosSchemasUtilizados(schemasUtilizados: Schema[], schema: Schema) {
        if (!schema) return;
        while (schema.isArray) {
            schema = schema.tipoArrayItem
        }
        if (schema.isObjeto && !schemasUtilizados.some(schemaCacheado => schema.tipo == schemaCacheado.tipo)) {
            schemasUtilizados.push(schema);
        }
    }

    static removeSpace(string: string): string {
        return string.replace(" ", "");
    }
    static toCamelCase(string: string): string {
        return `${string.charAt(0).toLowerCase()}${string.slice(1)}`
    }

    static pathSwaggerToExpressPath(api: APIDefinition): string {
        return api.path.replace(/\{([^\}]+)\}/g, (fullMatch: string, idPathParam: string) => {
            return this.getRegexForPathParam(api.pathParams.filter(pathParam => pathParam.nome === idPathParam)[0])
        })
    }

    static getRegexForPathParam(pathParam: PathParam): string {
        switch (pathParam.tipo) {
            case PathParamTipo.NUMBER:
                return `:${pathParam.nome}(\\\\d+)`;
            case PathParamTipo.STRING:
            default:
                return `:${pathParam.nome}`
        }
    }

    static getTypescriptTypingForPropriedade(propriedade: Schema): string {
        if(!propriedade){
            return ""
        }
        if (propriedade.isArray) {
            return `${this.getTypescriptTypingForPropriedade(propriedade.tipoArrayItem)}[]`
        }
        if(propriedade.isObjeto){
            return `${propriedade.tipo}`
        }
        switch (propriedade.tipo) {
            case TipoPropriedade.DATE:
                return "Date"
            case TipoPropriedade.NUMBER:
                return "number"
            case TipoPropriedade.BOOLEAN:
                return "boolean"
            case TipoPropriedade.STRING:
            case TipoPropriedade.FILE:
                return "string"
            default:
                return "any";
        }

    }

}