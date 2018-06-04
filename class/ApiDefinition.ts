import { Schema } from "./Schema";
import { PathParam } from "./PathParam";

export class APIDefinition {
    path: string;
    metodo: string;
    resumo: string;
    descricao: string;
    pathParams: PathParam[];
    saida: Schema;
    entrada: Schema;
}