"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var stream_1 = require("stream");
var WriterService_1 = require("./WriterService");
// var swaggerJson = require('./swagger.json')
// var agrupamentosServicos: any = {}
var servicos = [];
var entidades = [];
var ServiceStream = /** @class */ (function (_super) {
    __extends(ServiceStream, _super);
    function ServiceStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServiceStream.prototype._write = function (chunk, encoding, done) {
        console.log(chunk);
        done();
    };
    return ServiceStream;
}(stream_1.Writable));
var requestTemplateString = fs.readFileSync('./request-template.template').toString();
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
    // console.log(JSON.stringify(servicos));
    servicos.forEach(function (servico) {
        if (servico.apis.length) {
            // var servico = servicos[0];
            var writerStream = fs.createWriteStream("./server/api/" + servico.nome + ".js", { flags: 'w' })
                .on('finish', function () {
                console.log("Write Finish.");
            })
                .on('error', function (err) {
                console.log(err.stack);
            });
            writerStream.write("module.exports =  function " + servico.nome.replace(" ", "") + "(app) {\n\n");
            servico.apis.forEach(function (api) {
                writerStream.write(WriterService_1.WriterService.getTemplateForApi(requestTemplateString, api, entidades));
            });
            writerStream.write('}');
            writerStream.end();
        }
    });
    // Mark the end of file
    // });
    cb(null);
}))
    .pipe(new ServiceStream());
setInterval(function () { }, 1 << 30);
