import * as fs from "fs";
import * as jsonstream from "jsonstream";
import * as es from "event-stream";
import { Service } from "./class/Service";
import { UtilService } from "./UtilService";
import { SwaggerMethodDefinition } from "./class/swagger/SwaggerMethodDefinition";
import { SwaggerEntidade } from "./class/swagger/SwaggerEntidade";
import { Entidade } from "./class/Entidade";
import { WriterTSService } from "./WriterTSService";
import { WriterTSEntity } from "./WriterTSEntity";
import { AgnularWriterEntityFactory } from "./AgnularWriterEntityFactory";
import { AngularWriterService } from "./AngularWriterService";

// var swaggerJson = require('./swagger.json')


// var agrupamentosServicos: any = {}
var servicos: Service[] = []
var entidades: Entidade[] = [];

var stream = fs.createReadStream('swagger-teste.json', { encoding: 'utf8' })
    .pipe(jsonstream.parse(null))
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

        var deleteFolderRecursive = function(path: string) {
            if (fs.existsSync(path)) {
              fs.readdirSync(path).forEach(function(file, index){
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                  deleteFolderRecursive(curPath);
                } else { // delete file
                  fs.unlinkSync(curPath);
                }
              });
              fs.rmdirSync(path);
            }
          };

          if(fs.existsSync('./src/server')) deleteFolderRecursive('./src/server/api');
        if(fs.existsSync('./src/server')) deleteFolderRecursive('./src/server/entidade');
        if(fs.existsSync('./src/cliente')) deleteFolderRecursive('./src/cliente');
        // APOS MAPEAR
        if(!fs.existsSync('./src/server')) fs.mkdirSync('./src/server')
        if(!fs.existsSync('./src/server/entidade')) fs.mkdirSync('./src/server/entidade')
        if(!fs.existsSync('./src/server/api')) fs.mkdirSync('./src/server/api')
        if(!fs.existsSync('./src/cliente')) fs.mkdirSync('./src/cliente')
        if(!fs.existsSync('./src/cliente/entidade')) fs.mkdirSync('./src/cliente/entidade')
        if(!fs.existsSync('./src/cliente/service')) fs.mkdirSync('./src/cliente/service')

        entidades.forEach(entidade => {
            var servico = servicos[0];
            var writerStreamTSEntity = fs.createWriteStream(`./src/server/entidade/${entidade.nome}.ts`, { flags: 'w' })
                .on('finish', function () {
                    console.log("Write Finish.");
                })
                .on('error', function (err) {
                    console.log(err.stack);
                });
            var entityWriter = new WriterTSEntity()
            entityWriter.writeEntity(writerStreamTSEntity, entidade)
            writerStreamTSEntity.end();

            var writerStreamAngular = fs.createWriteStream(`./src/cliente/entidade/${entidade.nome}.js`, { flags: 'w' })
                .on('finish', function () {
                    console.log("Write Finish.");
                })
                .on('error', function (err) {
                    console.log(err.stack);
                });
            var angularFactoryWriter = new AgnularWriterEntityFactory()
            angularFactoryWriter.writeEntity(writerStreamAngular, entidade, entidades)
            writerStreamAngular.end();


        })

       
        // console.log(JSON.stringify(servicos));
        servicos.forEach(servico => {
            if (servico.apis.length) {
                var writerStreamTSService = fs.createWriteStream(`./src/server/api/${servico.nome}.ts`, { flags: 'w' })
                    .on('finish', function () {
                        console.log("Write Finish.");
                    })
                    .on('error', function (err) {
                        console.log(err.stack);
                    });
                var serviceWriter = new WriterTSService()
                serviceWriter.entidades = entidades;
                serviceWriter.writeService(writerStreamTSService, servico);
                writerStreamTSService.end();
            }
        })

        // console.log(JSON.stringify(servicos));
        servicos.forEach(servico => {
            if (servico.apis.length) {
                var writerStreamTSService = fs.createWriteStream(`./src/cliente/service/${servico.nome}.js`, { flags: 'w' })
                    .on('finish', function () {
                        console.log("Write Finish.");
                    })
                    .on('error', function (err) {
                        console.log(err.stack);
                    });
                var angularServiceWriter = new AngularWriterService()
                angularServiceWriter.entidades = entidades;
                angularServiceWriter.writeService(writerStreamTSService, servico);
                writerStreamTSService.end();
            }
        })





        cb(null)

    }))

setInterval(() => { }, 1 << 30);