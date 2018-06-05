import * as fs from "fs";
import * as JSONStream from "JSONStream";
import * as es from "event-stream";
import { Service } from "./class/Service";
import { UtilService } from "./UtilService";
import { SwaggerMethodDefinition } from "./class/swagger/SwaggerMethodDefinition";
import { SwaggerEntidade } from "./class/swagger/SwaggerEntidade";
import { APIDefinition } from "./class/ApiDefinition";
import { Entidade } from "./class/Entidade";
import { Readable, Writable } from "stream";
import { WriterService } from "./WriterService";
import { WriterEntity } from "./WriterEntity";

// var swaggerJson = require('./swagger.json')


// var agrupamentosServicos: any = {}
var servicos: Service[] = []
var entidades: Entidade[] = [];

var stream = fs.createReadStream('swagger-teste.json', { encoding: 'utf8' })
    .pipe(JSONStream.parse(null))
    .pipe(es.map(function (swaggerJson: any, cb: any) {
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
                const swaggerEntidade: SwaggerEntidade = definitions[entidadeName];
                entidades.push(UtilService.converterEntidadeFromSwaggerEntidade(entidadeName, swaggerEntidade));
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
                            service.apis.push(UtilService.getApiDefinitionFromSwaggerMethodDefinition(methodString, pathString, methodApi));
                        } else {
                            console.warn(`Service ${methodApi.tags[0]} não encontrada`)
                        }
                    }
                }
            }
        }
        entidades.forEach(entidade => {
            // var servico = servicos[0];
            var writerStream = fs.createWriteStream(`./src/server/entidade/${entidade.nome}.ts`, { flags: 'w' })
                .on('finish', function () {
                    console.log("Write Finish.");
                })
                .on('error', function (err) {
                    console.log(err.stack);
                });
            var entityWriter = new WriterEntity()
            entityWriter.writeEntity(writerStream, entidade)
            writerStream.end();

        })
        // console.log(JSON.stringify(servicos));
        servicos.forEach(servico => {
            if (servico.apis.length) {
                // var servico = servicos[0];
                var writerStream = fs.createWriteStream(`./src/server/api/${servico.nome}.ts`, { flags: 'w' })
                    .on('finish', function () {
                        console.log("Write Finish.");
                    })
                    .on('error', function (err) {
                        console.log(err.stack);
                    });
                var serviceWriter = new WriterService()
                serviceWriter.entidades = entidades;
                serviceWriter.writeService(writerStream, servico);
                writerStream.end();
            }
        })




        // Mark the end of file
        // });
        cb(null)

    }))

setInterval(() => { }, 1 << 30);