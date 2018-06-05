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
var es = __importStar(require("event-stream"));
var Service_1 = require("./class/Service");
var UtilService_1 = require("./UtilService");
var WriterService_1 = require("./WriterService");
var WriterEntity_1 = require("./WriterEntity");
// var swaggerJson = require('./swagger.json')
// var agrupamentosServicos: any = {}
var servicos = [];
var entidades = [];
var stream = fs.createReadStream('swagger-teste.json', { encoding: 'utf8' })
    .pipe(JSONStream.parse(null))
    .pipe(es.map(function (swaggerJson, cb) {
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
            var swaggerEntidade = definitions[entidadeName];
            entidades.push(UtilService_1.UtilService.converterEntidadeFromSwaggerEntidade(entidadeName, swaggerEntidade));
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
                        service.apis.push(UtilService_1.UtilService.getApiDefinitionFromSwaggerMethodDefinition(methodString, pathString, methodApi));
                    }
                    else {
                        console.warn("Service " + methodApi.tags[0] + " n\u00E3o encontrada");
                    }
                }
            }
        }
    }
    entidades.forEach(function (entidade) {
        // var servico = servicos[0];
        var writerStream = fs.createWriteStream("./src/server/entidade/" + entidade.nome + ".ts", { flags: 'w' })
            .on('finish', function () {
            console.log("Write Finish.");
        })
            .on('error', function (err) {
            console.log(err.stack);
        });
        var entityWriter = new WriterEntity_1.WriterEntity();
        entityWriter.writeEntity(writerStream, entidade);
        writerStream.end();
    });
    // console.log(JSON.stringify(servicos));
    servicos.forEach(function (servico) {
        if (servico.apis.length) {
            // var servico = servicos[0];
            var writerStream = fs.createWriteStream("./src/server/api/" + servico.nome + ".ts", { flags: 'w' })
                .on('finish', function () {
                console.log("Write Finish.");
            })
                .on('error', function (err) {
                console.log(err.stack);
            });
            var serviceWriter = new WriterService_1.WriterService();
            serviceWriter.entidades = entidades;
            serviceWriter.writeService(writerStream, servico);
            writerStream.end();
        }
    });
    // Mark the end of file
    // });
    cb(null);
}));
setInterval(function () { }, 1 << 30);
