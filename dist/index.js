"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var JSONStream = __importStar(require("JSONStream"));
var Service_1 = require("./class/Service");
var UtilService_1 = require("./UtilService");
var ApiDefinition_1 = require("./class/ApiDefinition");
var Entidade_1 = require("./class/Entidade");
var Propriedade_1 = require("./class/Propriedade");
// var swaggerJson = require('./swagger.json')
// var agrupamentosServicos: any = {}
var servicos = [];
var entidades = [];
var stream = fs.createReadStream('swagger.json', { encoding: 'utf8' });
stream
    .pipe(JSONStream.parse(null))
    .on('data', function (swaggerJson) {
    // console.log(data)
    swaggerJson.tags.forEach(function (tag) {
        var servico = new Service_1.Service();
        servico.tag = tag.name;
        servico.nome = UtilService_1.UtilService.tagNameToServiceName(tag.name);
        servico.apis = [];
        servicos.push(servico);
    });
    var definitions = swaggerJson.definitions;
    for (var entidadeName in definitions) {
        if (definitions.hasOwnProperty(entidadeName)) {
            var entidade = new Entidade_1.Entidade();
            var swaggerEntidade = definitions[entidadeName];
            entidade.nome = entidadeName;
            var swaggerPropriedades = swaggerEntidade.properties;
            for (var propriedadeName in swaggerPropriedades) {
                if (swaggerPropriedades.hasOwnProperty(propriedadeName)) {
                    var propriedade = new Propriedade_1.Propriedade();
                    propriedade.nome = propriedadeName;
                    var swaggerPropriedade = swaggerPropriedades[propriedadeName];
                    UtilService_1.UtilService.setJavascriptTypeBySwaggerPropriedade(propriedade, swaggerPropriedade);
                }
            }
            entidades.push(entidade);
        }
    }
    swaggerJson.definitions;
    var paths = swaggerJson.paths;
    for (var pathString in paths) {
        if (paths.hasOwnProperty(pathString)) {
            var swaggerPath = paths[pathString];
            for (var methodString in swaggerPath) {
                if (swaggerPath.hasOwnProperty(methodString)) {
                    var methodApi = swaggerPath[methodString];
                    var service = UtilService_1.UtilService.getServiceByTag(servicos, methodApi.tags[0]);
                    if (service) {
                        var api = new ApiDefinition_1.APIDefinition();
                        api.metodo = methodString;
                        api.path = pathString;
                        var nomeEntidadeSaida = UtilService_1.UtilService.getNomeRetornoFromMethodApi(methodApi);
                        if (nomeEntidadeSaida) {
                            var entidadeSaida = UtilService_1.UtilService.findEntidadePorNome(entidades, nomeEntidadeSaida);
                            if (entidadeSaida) {
                                api.saida = entidadeSaida;
                            }
                        }
                        service.apis.push(api);
                    }
                    else {
                        console.warn("Service " + methodApi.tags[0] + " n\u00E3o encontrada");
                    }
                }
            }
        }
    }
    console.log(JSON.stringify(servicos));
});
setInterval(function () { }, 1 << 30);
