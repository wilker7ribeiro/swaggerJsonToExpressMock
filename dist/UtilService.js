"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SwaggerEntidadePropriedade_1 = require("./class/swagger/SwaggerEntidadePropriedade");
var Entidade_1 = require("./class/Entidade");
var Schema_1 = require("./class/Schema");
var PathParam_1 = require("./class/PathParam");
var ApiDefinition_1 = require("./class/ApiDefinition");
var DEEP_LEVEL_DO_MOCK = 3;
var UtilService = /** @class */ (function () {
    function UtilService() {
    }
    UtilService.tagNameToServiceName = function (tagName) {
        return tagName.split('-')
            .map(function (palavra) { return "" + palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase(); })
            .join(" ");
    };
    UtilService.getServiceByTag = function (services, tag) {
        for (var i = 0; i < services.length; i++) {
            var service = services[i];
            if (service.tag === tag) {
                return service;
            }
        }
        return null;
    };
    UtilService.getEntidadeNameFromRef = function (refString) {
        var pathArray = refString.split('/');
        return pathArray[pathArray.length - 1];
    };
    UtilService.setSchemaTypeBySwaggerPropriedade = function (propriedade, swaggerPropridade) {
        propriedade.descricao = swaggerPropridade.description;
        if (swaggerPropridade.$ref) {
            propriedade.tipo = this.getEntidadeNameFromRef(swaggerPropridade.$ref);
            propriedade.isObjeto = true;
            return;
        }
        /** @todo em algum momento pode cair como type "object" sem ter o $ref, acho que é quando é objetos dinamicos, nesse caso não sei a resposta */
        switch (swaggerPropridade.type) {
            case "file":
                propriedade.tipo = Schema_1.TipoPropriedade.FILE;
                return;
            case "array":
                propriedade.isArray = true;
                propriedade.tipo = Schema_1.TipoPropriedade.ARRAY;
                propriedade.tipoArrayItem = new Schema_1.Schema();
                this.setSchemaTypeBySwaggerPropriedade(propriedade.tipoArrayItem, swaggerPropridade.items);
                return;
            case "boolean":
                propriedade.tipo = Schema_1.TipoPropriedade.BOOLEAN;
                return;
            case "string":
                switch (swaggerPropridade.format) {
                    case "date-time":
                        propriedade.tipo = Schema_1.TipoPropriedade.DATE;
                        return;
                    default:
                        propriedade.tipo = Schema_1.TipoPropriedade.STRING;
                        return;
                }
            case "number":
            case "integer":
                propriedade.tipo = Schema_1.TipoPropriedade.NUMBER;
                return;
            default:
                propriedade.tipo = Schema_1.TipoPropriedade.ANY;
                return;
        }
    };
    UtilService.findEntidadePorNome = function (entidades, nomeEntidade) {
        for (var i = 0; i < entidades.length; i++) {
            var entidade = entidades[i];
            if (entidade.nome === nomeEntidade)
                return entidade;
        }
        return null;
    };
    UtilService.criarJavascriptValuePeloSchema = function (entidades, propriedade, deepLevel) {
        if (propriedade.isObjeto) {
            if (deepLevel == DEEP_LEVEL_DO_MOCK) {
                return null;
            }
            return this.criarEntidadeObjByNome(entidades, propriedade.tipo, deepLevel + 1);
        }
        else if (propriedade.isArray) {
            if (deepLevel == DEEP_LEVEL_DO_MOCK) {
                return [];
            }
            return [this.criarJavascriptValuePeloSchema(entidades, propriedade.tipoArrayItem, deepLevel)];
        }
        else {
            return this.criarJavascriptValuePeloSchemaPrimitivo(entidades, propriedade.tipo);
        }
    };
    UtilService.criarJavascriptValuePeloSchemaPrimitivo = function (entidades, tipoPropriedade) {
        switch (tipoPropriedade) {
            case Schema_1.TipoPropriedade.BOOLEAN:
                return false;
            case Schema_1.TipoPropriedade.DATE:
                return new Date();
            case Schema_1.TipoPropriedade.NUMBER:
                return 10;
            case Schema_1.TipoPropriedade.STRING:
                return "String";
            case Schema_1.TipoPropriedade.FILE:
                return "FILE BASE64";
            case Schema_1.TipoPropriedade.ANY:
                return null;
        }
    };
    UtilService.criarEntidadeObjByNome = function (entidades, nomeEntidade, deepLevel) {
        var entidade = this.findEntidadePorNome(entidades, nomeEntidade);
        if (entidade) {
            return this.criarEntidadeObj(entidades, entidade, deepLevel);
        }
        return {};
    };
    UtilService.criarEntidadeObj = function (entidades, entidade, deepLevel) {
        var _this = this;
        var obj = {};
        if (entidade) {
            entidade.propriedades.forEach(function (propriedade) {
                obj[propriedade.nome] = _this.criarJavascriptValuePeloSchema(entidades, propriedade, deepLevel);
            });
        }
        else {
            return {};
        }
        return obj;
    };
    UtilService.converterEntidadeFromSwaggerEntidade = function (entidadeName, swaggerEntidade) {
        var entidade = new Entidade_1.Entidade();
        entidade.nome = entidadeName;
        entidade.propriedades = [];
        var swaggerPropriedades = swaggerEntidade.properties;
        for (var propriedadeName in swaggerPropriedades) {
            if (swaggerPropriedades.hasOwnProperty(propriedadeName)) {
                var propriedade = new Schema_1.Schema();
                propriedade.nome = propriedadeName;
                var swaggerPropriedade = swaggerPropriedades[propriedadeName];
                UtilService.setSchemaTypeBySwaggerPropriedade(propriedade, swaggerPropriedade);
                entidade.propriedades.push(propriedade);
            }
        }
        return entidade;
    };
    UtilService.getResponseSchemaFromSwaggerMethodDefinition = function (swaggerMethod) {
        if (swaggerMethod.responses[200]) {
            return this.converterSwaggerSchemaInSchema(swaggerMethod.responses[200].schema);
        }
        return null;
    };
    UtilService.converterSwaggerSchemaInSchema = function (swaggerSchema) {
        var schema = new Schema_1.Schema();
        this.setSchemaTypeBySwaggerPropriedade(schema, swaggerSchema);
        return schema;
    };
    UtilService.getBodyParamSchemeFromSwaggerMethodDefinition = function (swaggerMethod) {
        var bodyParam = this.getBodyParameterFromSwaggerMethodDefinitionParameters(swaggerMethod.parameters);
        if (bodyParam) {
            var schema = new Schema_1.Schema();
            this.setSchemaTypeBySwaggerPropriedade(schema, bodyParam);
            return schema;
        }
        return null;
    };
    UtilService.getBodyParameterFromSwaggerMethodDefinitionParameters = function (parameters) {
        if (parameters === void 0) { parameters = []; }
        for (var i = 0; i < parameters.length; i++) {
            var parameter = parameters[i];
            if (parameter.in == "body") {
                return parameter;
            }
        }
        return null;
    };
    UtilService.getPathParamsFromSwaggerMethodDefinition = function (swaggerMethod) {
        var _this = this;
        if (!swaggerMethod.parameters) {
            return [];
        }
        return swaggerMethod.parameters
            .filter(function (param) { return param.in === 'path'; })
            .map(function (param) {
            return {
                nome: param.name,
                obrigatorio: param.required,
                descricao: param.description,
                tipo: _this.getPathParamTipo(param.type)
            };
        });
    };
    UtilService.getPathParamTipo = function (paramType) {
        switch (paramType) {
            case SwaggerEntidadePropriedade_1.SwaggerEntidadeType.STRING:
                return PathParam_1.PathParamTipo.STRING;
            case SwaggerEntidadePropriedade_1.SwaggerEntidadeType.INTEGER:
            case SwaggerEntidadePropriedade_1.SwaggerEntidadeType.NUMBER:
                return PathParam_1.PathParamTipo.NUMBER;
            default:
                return PathParam_1.PathParamTipo.NUMBER;
        }
    };
    UtilService.getApiDefinitionFromSwaggerMethodDefinition = function (methodType, requestPath, swaggerMethodApi) {
        var api = new ApiDefinition_1.APIDefinition();
        api.metodo = methodType;
        api.resumo = swaggerMethodApi.sumary;
        api.descricao = swaggerMethodApi.description;
        api.nomeMetodo = swaggerMethodApi.operationId;
        api.path = requestPath;
        api.pathParams = UtilService.getPathParamsFromSwaggerMethodDefinition(swaggerMethodApi);
        var saidaSchema = UtilService.getResponseSchemaFromSwaggerMethodDefinition(swaggerMethodApi);
        if (saidaSchema) {
            api.saida = saidaSchema;
        }
        var entradaSchema = UtilService.getBodyParamSchemeFromSwaggerMethodDefinition(swaggerMethodApi);
        if (entradaSchema) {
            api.entrada = entradaSchema;
        }
        return api;
    };
    return UtilService;
}());
exports.UtilService = UtilService;
