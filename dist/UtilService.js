"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    UtilService.getNomeRetornoFromMethodApi = function (methodApi) {
        if (methodApi.responses[200] && methodApi.responses[200].items && methodApi.responses[200].items.$ref) {
            var refString = methodApi.responses[200].schema.items.$ref;
            this.getEntidadeNameFromRef(refString);
        }
        return null;
    };
    UtilService.getEntidadeNameFromRef = function (refString) {
        var pathArray = refString.split('/');
        return pathArray[pathArray.length - 1];
    };
    UtilService.isTipoPrimitivo = function (tipo) {
        return ["boolean", "string", "number", "date"].indexOf(tipo) !== -1;
    };
    UtilService.setJavascriptTypeBySwaggerPropriedade = function (propriedade, swaggerPropridade) {
        if (swaggerPropridade.$ref) {
            propriedade.tipo = this.getEntidadeNameFromRef(swaggerPropridade.$ref);
            propriedade.isObjeto = true;
            return;
        }
        switch (swaggerPropridade.type) {
            case "array":
                propriedade.tipo = "array";
                return;
            case "boolean":
                propriedade.tipo = "boolean";
                return;
            case "string":
                switch (swaggerPropridade.format) {
                    case "date-time":
                        propriedade.tipo = "date";
                        return;
                    default:
                        propriedade.tipo = "string";
                        return;
                }
            case "integer":
                propriedade.tipo = "number";
                return;
            default:
                propriedade.tipo = "any";
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
    UtilService.pathSwaggerToExpressPath = function (swaggerPath) {
        return swaggerPath.replace(/\{([^\}]+)\}/g, ":$1");
    };
    return UtilService;
}());
exports.UtilService = UtilService;
