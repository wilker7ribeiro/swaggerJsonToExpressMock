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

export class WriterService {
    entidades: Entidade[] = [];
    writeService(writeStream: WriteStream, servico: Service) {
        this.getSchemasUtilizados(servico).forEach(schema => {
            writeStream.write(`import { ${schema.tipo} } from '../entidade/${schema.tipo}';\n`)
        });

        writeStream.write(`import { Request, Response, NextFunction } from 'express';\n`)
        writeStream.write(`import { ServiceApi } from '../lib/ServiceApiAnnotation';\n`)
        writeStream.write(`import { RequestMapping } from '../lib/RequestMappingAnnotation';\n`)
        writeStream.write('\n');
        writeStream.write('\n');
        writeStream.write(`@ServiceApi()\n`);
        writeStream.write(`export class ${servico.nome.replace(" ", "")}Service {\n\n`)
        servico.apis.forEach(api => {
            writeStream.write(this.getTemplateForApi(api));
        })
        writeStream.write('}');
    }

    getSchemasUtilizados(servico: Service): Schema[] {
        var schemasUtilizados: Schema[] = [];
        servico.apis.forEach(api => WriterUtil.adicionarNosSchemasUtilizados(schemasUtilizados, api.saida))
        return schemasUtilizados;
    }
    getTemplateForApi(api: APIDefinition): string {
        return this.criarTemplateForApi(api);
    }

    criarTemplateForApi(api: APIDefinition): string {

        let template = `\t@RequestMapping({method: "${api.metodo}", path:"${WriterUtil.pathSwaggerToExpressPath(api)}"})\n`
        template += `\tasync ${api.nomeMetodo}(req: Request, res: Response, next: NextFunction) {\n`
        if (api.saida) {
            template += `${this.getBodyTemplate(api.saida)}\n`
        } else {
            template += `\t\tres.sendStatus(200)\n`
        }
        template += `\t};`;

        return template + '\n\n'

    }

    getBodyTemplate(schemaSaida: Schema) {
        var variableName = ''
        var variableInitialization = UtilService.stringifyWithDates(UtilService.criarJavascriptValuePeloSchema(this.entidades, schemaSaida, 1));
        if (schemaSaida.isArray) {
            if (schemaSaida.tipoArrayItem.isArray) {
                variableName = 'list';
            } else {
                variableName = WriterUtil.toCamelCase(schemaSaida.tipoArrayItem.tipo) + 'List';
            }
        } else {
            variableName = WriterUtil.toCamelCase(schemaSaida.tipo);
        }
        return `\t\tvar ${variableName}: ${WriterUtil.getTypescriptTypingForPropriedade(schemaSaida)} = ${variableInitialization}\n` + `\t\tres.json(${variableName})\n`
    }
}