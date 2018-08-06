import { Service } from "./class/Service";
import { SwaggerMethodDefinition } from "./class/swagger/SwaggerMethodDefinition";
import { SwaggerEntidadePropriedade, SwaggerEntidadeType } from "./class/swagger/SwaggerEntidadePropriedade";
import { Entidade } from "./class/Entidade";
import { Schema, TipoPropriedade } from "./class/Schema";
import { SwaggerEntidade } from "./class/swagger/SwaggerEntidade";
import { PathParam, PathParamTipo } from "./class/PathParam";
import { APIDefinition } from "./class/ApiDefinition";
const DEEP_LEVEL_DO_MOCK = 3;
export class UtilService {
    static tagNameToServiceName(tagName: string): string {
        return tagName.split('-')
            .map(palavra => `${palavra.charAt(0).toUpperCase()}${palavra.slice(1).toLowerCase()}`)
            .join(" ");
    }

    static getServiceByTag(services: Service[], tag: string): Service | null {
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            if (service.tag === tag) {
                return service;
            }
        }
        return null;
    }

    static getEntidadeNameFromRef(refString: string): string {
        var pathArray = refString.split('/')
        return pathArray[pathArray.length - 1]
    }

    static setSchemaTypeBySwaggerPropriedade(propriedade: Schema, swaggerPropridade: SwaggerEntidadePropriedade) {
        propriedade.descricao = swaggerPropridade.description;
        if (swaggerPropridade.$ref || (swaggerPropridade.schema && swaggerPropridade.schema.$ref)) {
            propriedade.tipo = this.getEntidadeNameFromRef(swaggerPropridade.$ref || swaggerPropridade.schema.$ref)
            propriedade.isObjeto = true;
            return;
        }
        /** @todo em algum momento pode cair como type "object" sem ter o $ref, acho que é quando é objetos dinamicos, nesse caso não sei a resposta */
        switch (swaggerPropridade.type) {
            case "file":
                propriedade.tipo = TipoPropriedade.FILE;
                return;
            case "array":
                propriedade.isArray = true;
                propriedade.tipo = TipoPropriedade.ARRAY;
                propriedade.tipoArrayItem = new Schema();
                this.setSchemaTypeBySwaggerPropriedade(propriedade.tipoArrayItem, swaggerPropridade.items);
                return;
            case "boolean":
                propriedade.tipo = TipoPropriedade.BOOLEAN;
                return;
            case "string":

                switch (swaggerPropridade.format) {
                    case "date-time":
                        propriedade.tipo = TipoPropriedade.DATE;
                        return;
                    default:
                        propriedade.tipo = TipoPropriedade.STRING;
                        return;
                }

            case "number":
            case "integer":
                propriedade.tipo = TipoPropriedade.NUMBER;
                return;
            default:
                propriedade.tipo = TipoPropriedade.ANY;
                return;
        }
    }

    static findEntidadePorNome(entidades: Entidade[], nomeEntidade: string): Entidade | null {
        for (let i = 0; i < entidades.length; i++) {
            const entidade = entidades[i];
            if (entidade.nome === nomeEntidade) return entidade;
        }
        return null;
    }




    static criarJavascriptValuePeloSchema(entidades: Entidade[], propriedade: Schema, deepLevel: number): any {
        if (propriedade.isObjeto) {
            if (deepLevel == DEEP_LEVEL_DO_MOCK) {
                return null
            }
            return this.criarEntidadeObjByNome(entidades, propriedade.tipo, deepLevel + 1);
        } else if (propriedade.isArray) {
            if (deepLevel == DEEP_LEVEL_DO_MOCK) {
                return []
            }
            return [this.criarJavascriptValuePeloSchema(entidades, propriedade.tipoArrayItem, deepLevel)]
        } else {
            return this.criarJavascriptValuePeloSchemaPrimitivo(entidades, propriedade);
        }
    }
    static criarJavascriptValuePeloSchemaPrimitivo(entidades: Entidade[], propriedade: Schema): any {
        switch (propriedade.tipo) {
            case TipoPropriedade.BOOLEAN:
                return false;
            case TipoPropriedade.DATE:
                return new Date();
            case TipoPropriedade.NUMBER:
                return 10
            case TipoPropriedade.STRING:
                return propriedade.nome || "resultado";
            case TipoPropriedade.FILE:
                return "FILE BASE64";
            case TipoPropriedade.ANY:
                return null;
        }
    }
    static criarEntidadeObjByNome(entidades: Entidade[], nomeEntidade: string, deepLevel: number): any {
        let entidade = this.findEntidadePorNome(entidades, nomeEntidade);
        if (entidade) {
            return this.criarEntidadeObj(entidades, entidade, deepLevel)
        }
        return {};
    }

    static criarEntidadeObj(entidades: Entidade[], entidade: Entidade, deepLevel: number): any {
        let obj: any = {};
        if (entidade) {
            entidade.propriedades.forEach(propriedade => {
                obj[propriedade.nome] = this.criarJavascriptValuePeloSchema(entidades, propriedade, deepLevel);
            });
        } else {
            return {};
        }
        return obj
    }

    static converterEntidadeFromSwaggerEntidade(entidadeName: string, swaggerEntidade: SwaggerEntidade): Entidade {
        let entidade = new Entidade();
        entidade.nome = entidadeName;
        entidade.propriedades = []
        var swaggerPropriedades = swaggerEntidade.properties;
        for (const propriedadeName in swaggerPropriedades) {
            if (swaggerPropriedades.hasOwnProperty(propriedadeName)) {
                var propriedade = new Schema();
                propriedade.nome = propriedadeName;
                const swaggerPropriedade = swaggerPropriedades[propriedadeName];
                UtilService.setSchemaTypeBySwaggerPropriedade(propriedade, swaggerPropriedade);
                entidade.propriedades.push(propriedade);
            }
        }
        return entidade;
    }

    static getResponseSchemaFromSwaggerMethodDefinition(swaggerMethod: SwaggerMethodDefinition): Schema | null {
        if (swaggerMethod.responses[200]) {
            return this.converterSwaggerSchemaInSchema(swaggerMethod.responses[200].schema)
        }
        return null;
    }
    static converterSwaggerSchemaInSchema(swaggerSchema: SwaggerEntidadePropriedade): Schema {
        var schema = new Schema();
        this.setSchemaTypeBySwaggerPropriedade(schema, swaggerSchema);
        return schema;
    }

    static getBodyParamSchemeFromSwaggerMethodDefinition(swaggerMethod: SwaggerMethodDefinition): Schema | null {
        var bodyParam = this.getBodyParameterFromSwaggerMethodDefinitionParameters(swaggerMethod.parameters);
        if (bodyParam) {
            var schema = new Schema();
            this.setSchemaTypeBySwaggerPropriedade(schema, bodyParam);
            return schema;
        }
        return null;
    }
    static getBodyParameterFromSwaggerMethodDefinitionParameters(parameters: SwaggerEntidadePropriedade[] = []): SwaggerEntidadePropriedade | null {
        for (let i = 0; i < parameters.length; i++) {
            const parameter = parameters[i];
            if (parameter.in == "body") {
                return parameter;
            }
        }
        return null;
    }

    static getPathParamsFromSwaggerMethodDefinition(swaggerMethod: SwaggerMethodDefinition): PathParam[] {
        if (!swaggerMethod.parameters) {
            return [];
        }
        return swaggerMethod.parameters
            .filter(param => param.in === 'path')
            .map(param => {
                return {
                    nome: param.name,
                    obrigatorio: param.required,
                    descricao: param.description,
                    tipo: this.getPathParamTipo(param.type)
                };
            })
    }

    static getPathParamTipo(paramType: string | SwaggerEntidadeType): PathParamTipo {
        switch (paramType) {
            case SwaggerEntidadeType.STRING:
                return PathParamTipo.STRING;
            case SwaggerEntidadeType.INTEGER:
            case SwaggerEntidadeType.NUMBER:
                return PathParamTipo.NUMBER;
            default:
                return PathParamTipo.NUMBER
        }

    }

    static getApiDefinitionFromSwaggerMethodDefinition(methodType: string, requestPath: string, swaggerMethodApi: SwaggerMethodDefinition): APIDefinition {
        var api: APIDefinition = new APIDefinition();
        api.metodo = methodType;
        api.resumo = swaggerMethodApi.sumary;
        api.descricao = swaggerMethodApi.description;
        api.nomeMetodo = swaggerMethodApi.operationId;
        api.path = requestPath;
        api.pathParams = UtilService.getPathParamsFromSwaggerMethodDefinition(swaggerMethodApi);
        let saidaSchema = UtilService.getResponseSchemaFromSwaggerMethodDefinition(swaggerMethodApi);
        if (saidaSchema) {
            api.saida = saidaSchema;
        }
        let entradaSchema = UtilService.getBodyParamSchemeFromSwaggerMethodDefinition(swaggerMethodApi);
        if (entradaSchema) {
            api.entrada = entradaSchema;
        }
        return api;
    }

    static stringifyWithDates(any: any): any {
        if (any === undefined || any === null) {
            return null
        }
        if (Array.isArray(any)) {
            return `[ ${any.map(UtilService.stringifyWithDates).join(', ')} ]`
        }
        if(any instanceof Date){
            return `new Date(${any.getTime()})`
        }
        if(typeof any === "object"){
            let string = '{\n'
            for (const propertyName in any) {
                if (any.hasOwnProperty(propertyName)) {
                    const propertyValue = any[propertyName];
                    string+= `  ${propertyName}: ${UtilService.stringifyWithDates(propertyValue)},\n`
                }
            }
            var result = string.substring(0, string.length -2) + "\n}";;
            console.log(result)
            return result;
            
        }
        if(typeof any === 'string'){
            return `"${any}"`
        }
        return any;
    }
}