import { APIDefinition } from "./class/ApiDefinition";
import { RequestTemplateVariables } from "./class/RequestTemplateVariables";
import { UtilService } from "./UtilService";
import { Entidade } from "./class/Entidade";
var jsBeautify = require('js-beautify').js

const regexReplaceTemplate = /<% *([^ *%>]+) %>/g;
export class WriterService {

    static getTemplateForApi(templateString: string, api: APIDefinition, entidades: Entidade[]): string {
        return this.executeReplaceTemplate(templateString, this.criarRequestTemplateVariables(api, entidades))
    }

    static criarRequestTemplateVariables(api: APIDefinition, entidades: Entidade[]): RequestTemplateVariables {
        var requestTemplateVariables = new RequestTemplateVariables();
        requestTemplateVariables.requestMethod = api.metodo;
        requestTemplateVariables.requestUrl = UtilService.pathSwaggerToExpressPath(api.path);
        if (api.saida) {
            requestTemplateVariables.responseObj = UtilService.criarJavascriptValuePeloSchema(entidades, api.saida, 1);
        }
        return requestTemplateVariables;
    }

    static executeReplaceTemplate(templateString: string, rtv: RequestTemplateVariables): string {
        let template = ''
        template += `app.${rtv.requestMethod}('${rtv.requestUrl}', (req, res)=>{`
        if (rtv.responseObj) {
            template += `
            var obj = ${JSON.stringify(rtv.responseObj, null, 2)}
            res.send(obj)
            `
        } else {
            template += `res.sendStatus(200)`
        }
        template += `});`;

        return jsBeautify(template, {
            indent_size: 4,
            space_in_empty_paren: true,
            end_with_newline: true,
            break_chained_methods: true,
        }) + '\n';
    }





}