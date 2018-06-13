import { APIDefinition } from "./class/ApiDefinition";
import { RequestTemplateVariables } from "./class/RequestTemplateVariables";
import { UtilService } from "./UtilService";
import { Entidade } from "./class/Entidade";
import { WriteStream } from "fs";
import { Service } from "./class/Service";
import { Schema, TipoPropriedade } from "./class/Schema";
import { PathParam, PathParamTipo } from "./class/PathParam";
import { WriterUtil } from "./WriterUtil";
import jsBeautify = require('js-beautify')

export class AgnularWriterEntityFactory {

    writeEntity(writeStream: WriteStream, entidade: Entidade, entidades: Entidade[]) {

        var className = entidade.nome.replace(" ", "");

        var entityDependencies = this.getSchemasUtilizados(entidade).map(schema => schema.tipo).join(', ')
        var template =
            `;(function() {
                'use strict';
        
                /**
                * @module <modulo>
                */
                angular
                    .module('<modulo>.providers.factory')
                    .factory('${className}', ${className}Factory);
                
                /* @ngInject */
                function ${className}Factory(${entityDependencies}) {
                    function ${className}(){
                        ${ entidade.propriedades.map(propriedade => `\t\t\tthis.${WriterUtil.toCamelCase(propriedade.nome)} = ${UtilService.stringifyWithDates(UtilService.criarJavascriptValuePeloSchema(entidades, propriedade, 2))};`).join('\n')}
                        this.id = '';
                    }
                    return ${className};
                }
            }());`

        writeStream.write(template);
    }


    getSchemasUtilizados(entidade: Entidade): Schema[] {
        var schemasUtilizados: Schema[] = [];
        entidade.propriedades.forEach(propriedade => WriterUtil.adicionarNosSchemasUtilizados(schemasUtilizados, propriedade))
        return schemasUtilizados;
    }
}
