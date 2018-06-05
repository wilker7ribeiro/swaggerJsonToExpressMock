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

export class WriterEntity {

    writeEntity(writeStream: WriteStream, entidade: Entidade) {
        this.getSchemasUtilizados(entidade).forEach(schema => {
            writeStream.write(`import { ${schema.tipo} } from './${schema.tipo}';\n`)
        });
        writeStream.write('\n');
        writeStream.write(`export class ${entidade.nome.replace(" ", "")} {\n`)

        writeStream.write(this.getPropriedadesTemplates(entidade))

        writeStream.write('}');
    }


    getPropriedadesTemplates(entidade: Entidade) {
        return entidade.propriedades.map(propriedade => {
            return this.getTemplateForPropriedade(propriedade);
        }).reduce((prev, current) => prev + current)
    }

    getSchemasUtilizados(entidade: Entidade): Schema[] {
        var schemasUtilizados: Schema[] = [];
        entidade.propriedades.forEach(propriedade => WriterUtil.adicionarNosSchemasUtilizados(schemasUtilizados, propriedade))
        return schemasUtilizados;
    }

    getTemplateForPropriedade(propriedade: Schema): string {
        return `    ${WriterUtil.toCamelCase(propriedade.nome)}: ${WriterUtil.getTypescriptTypingForPropriedade(propriedade)};\n`
    }



}
