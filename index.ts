import * as fs from "fs";
import * as JSONStream from "JSONStream";
import * as es from "event-stream";
import { Service } from "./class/Service";
import { UtilService } from "./UtilService";
import { SwaggerMethodDefinition } from "./class/swagger/SwaggerMethodDefinition";
import { SwaggerEntidade } from "./class/swagger/SwaggerEntidade";
import { APIDefinition } from "./class/ApiDefinition";
import { Entidade } from "./class/Entidade";
import { Propriedade } from "./class/Propriedade";
// var swaggerJson = require('./swagger.json')


// var agrupamentosServicos: any = {}
var servicos: Service[] = []
var entidades: Entidade[] = [];

var stream = fs.createReadStream('swagger.json', { encoding: 'utf8' });
stream
    .pipe(JSONStream.parse(null))
    .on('data', swaggerJson => {
        // console.log(data)
        swaggerJson.tags.forEach((tag: any) => {
            var servico = new Service();
            servico.tag = tag.name;
            servico.nome = UtilService.tagNameToServiceName(tag.name);
            servico.apis = [];
            servicos.push(servico)
        })

        var definitions: any = swaggerJson.definitions
        for (const entidadeName in definitions) {
            if (definitions.hasOwnProperty(entidadeName)) {
                var entidade = new Entidade();
                const swaggerEntidade: SwaggerEntidade = definitions[entidadeName];

                entidade.nome = entidadeName;
                var swaggerPropriedades = swaggerEntidade.properties;
                for (const propriedadeName in swaggerPropriedades) {
                    if (swaggerPropriedades.hasOwnProperty(propriedadeName)) {
                        var propriedade = new Propriedade();
                        propriedade.nome = propriedadeName;
                        const swaggerPropriedade = swaggerPropriedades[propriedadeName];
                        UtilService.setJavascriptTypeBySwaggerPropriedade(propriedade, swaggerPropriedade);
                    }
                }
                entidades.push(entidade);
            }
        }


        swaggerJson.definitions
        var paths: any = swaggerJson.paths;
        for (const pathString in paths) {
            if (paths.hasOwnProperty(pathString)) {
                const swaggerPath = paths[pathString];


                for (const methodString in swaggerPath) {
                    if (swaggerPath.hasOwnProperty(methodString)) {
                        const methodApi: SwaggerMethodDefinition = swaggerPath[methodString];

                        const service = UtilService.getServiceByTag(servicos, methodApi.tags[0]);
                        if (service) {
                            var api: APIDefinition = new APIDefinition();
                            api.metodo = methodString;
                            api.path = pathString;

                            var nomeEntidadeSaida = UtilService.getNomeRetornoFromMethodApi(methodApi);
                            if (nomeEntidadeSaida) {
                                var entidadeSaida = UtilService.findEntidadePorNome(entidades, nomeEntidadeSaida);
                                if (entidadeSaida) {
                                    api.saida = entidadeSaida;
                                }
                            }

                            service.apis.push(api)
                        } else {
                            console.warn(`Service ${methodApi.tags[0]} não encontrada`)
                        }

                    }
                }



            }
        }



        console.log(JSON.stringify(servicos));

    })


setInterval(() => { }, 1 << 30);