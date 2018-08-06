import { APIDefinition } from "./ApiDefinition";

export class Service {
    tag: string;
    nome: string;
    apis: APIDefinition[];

    getAllMetodosName(): string[] {
        return this.apis.map(api => api.nomeMetodo)
    }
}