import { Entidade } from "./Entidade";
import { PathParam } from "./PathParam";

export class APIDefinition {
    path: string;
    metodo: string;
    pathParams: PathParam[];
    saida: Entidade;
    entrada: Entidade;
}