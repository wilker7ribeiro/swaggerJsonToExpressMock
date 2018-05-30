import { Service } from "./class/Service";
import { SwaggerMethodDefinition } from "./class/swagger/SwaggerMethodDefinition";
import { SwaggerEntidadePropriedade } from "./class/swagger/SwaggerEntidadePropriedade";
import { Entidade } from "./class/Entidade";
import { Propriedade } from "./class/Propriedade";

export class UtilService {
    static tagNameToServiceName(tagName: string): string {
        return tagName.split('-')
            .map(palavra => `${palavra.charAt(0).toUpperCase()}${palavra.slice(1).toLowerCase()}`)
            .join(" ");
    }

    static getServiceByTag(services: Service[], tag: string): Service | null {
        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            if (service.tag === tag) {
                return service;
            }
        }
        return null;
    }

    static getNomeRetornoFromMethodApi(methodApi: SwaggerMethodDefinition): string | null {
        if (methodApi.responses[200] && methodApi.responses[200].items && methodApi.responses[200].items.$ref) {
            var refString = methodApi.responses[200].schema.items.$ref
            this.getEntidadeNameFromRef(refString);
        }
        return null;
    }

    static getEntidadeNameFromRef(refString: string): string {
        var pathArray = refString.split('/')
        return pathArray[pathArray.length - 1]
    }
    static isTipoPrimitivo(tipo: string): boolean {
        return ["boolean", "string", "number", "date"].indexOf(tipo) !== -1;
    }
    static setJavascriptTypeBySwaggerPropriedade(propriedade: Propriedade, swaggerPropridade: SwaggerEntidadePropriedade): void {

        if (swaggerPropridade.$ref) {
            propriedade.tipo = this.getEntidadeNameFromRef(swaggerPropridade.$ref)
            propriedade.isObjeto = true;
            return;
        }
        switch (swaggerPropridade.type) {
            case "array":
                propriedade.tipo = "array";
                return;
            case "boolean":
                propriedade.tipo = "boolean";
                return;
            case "string":

                switch (swaggerPropridade.format) {
                    case "date-time":
                        propriedade.tipo = "date";
                        return;
                    default:
                        propriedade.tipo = "string";
                        return;
                }

            case "integer":
                propriedade.tipo = "number";
                return;
            default:
                propriedade.tipo = "any";
                return;
        }
    }

    static findEntidadePorNome(entidades: Entidade[], nomeEntidade: string): Entidade | null {
        for (let i = 0; i < entidades.length; i++) {
            const entidade = entidades[i];
            if (entidade.nome === nomeEntidade) return entidade;
        }
        return null;
    }

    static pathSwaggerToExpressPath(swaggerPath: string): string {
        return swaggerPath.replace(/\{([^\}]+)\}/g, ":$1")
    }

}