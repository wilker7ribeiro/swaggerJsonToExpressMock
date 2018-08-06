import { APIDefinition } from "./class/ApiDefinition";
import { RequestTemplateVariables } from "./class/RequestTemplateVariables";
import { UtilService } from "./UtilService";
import { Entidade } from "./class/Entidade";
import { WriteStream } from "fs";
import { Service } from "./class/Service";
import { Schema, TipoPropriedade } from "./class/Schema";
import { PathParam, PathParamTipo } from "./class/PathParam";
import { WriterUtil } from "./WriterUtil";
var jsBeautify = require('js-beautify').js_beautify

export class AngularWriterService {
    entidades: Entidade[] = [];
    writeService(writeStream: WriteStream, servico: Service) {
        const metodosName = servico.getAllMetodosName();
        const serviceName = servico.nome.replace(" ", "");

        const template = `;(function() {
            'use strict';
    
            /**
            * @module <modulo>
            */
            angular
                .module('<modulo>.providers.service')
                .service('${serviceName}', ${serviceName}Service);
            
            /* @ngInject */
            function ${serviceName}Service(RestangularSISTEMA) {

                var endpoint = RestangularSISTEMA.all('${servico.tag}')

                ${
                    metodosName.map(metodosName => `this.${metodosName} = ${metodosName}`).join('\n')
                }
                
                ${
                    servico.apis.map(api => this.getTemplateForApi(api)).join('\n')
                }
        
                return this;
            }
        }());`
        writeStream.write(jsBeautify(template));
        
    }


    getTemplateForApi(api: APIDefinition): string {
        return this.criarTemplateForApi(api);
    }

    criarTemplateForApi(api: APIDefinition): string {

        return  `
        // ${api.metodo} ${api.path} = ${WriterUtil.getTypescriptTypingForPropriedade(api.saida) || 'null'}
        function ${api.nomeMetodo}(${this.getApiParam(api)}) {
            return endpoint${this.getRestangularPathApi(api)}.${api.metodo}(${WriterUtil.toCamelCase(api.entrada ? api.entrada.tipo : '')})
        };`;
         
    }

    getRestangularPathApi(api: APIDefinition) {
        var partialPaths = api.path.split('\/').filter(partialPath => partialPath);
        return partialPaths.map((partialPath, index) => {
            return `.${partialPaths.length === index + 1 ? api.saida && api.saida.isArray? 'all' : 'one' : 'one'}(${this.getRestangularPathParameter(partialPath)})`
        }).join("");
    }

    getRestangularOneOrAll(api: APIDefinition){

    }
    getRestangularPathParameter(partialPath: string){
        const result = /\{([^}]+)}/g.exec(partialPath)
        if(result){
            return `'${result[1]}', ${result[1]}`
        }
        return `'${partialPath}'`
    }
    getApiParam(api: APIDefinition): string {
        var params = api.pathParams.map(pathParam => WriterUtil.toCamelCase((pathParam.nome)));

        if(api.entrada && api.entrada.tipo){
            params.push(WriterUtil.toCamelCase(api.entrada.tipo));
        }
        return params.toString()
    }
}