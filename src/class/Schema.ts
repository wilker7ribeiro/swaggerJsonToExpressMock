import { isArray } from "util";

export class Schema {
    nome: string;
    tipo: string | TipoPropriedade;
    isArray: boolean;
    tipoArrayItem: Schema;
    descricao: string;
    isObjeto: boolean;
}

export enum TipoPropriedade {
    ANY = "any",
    ARRAY = "array",
    NUMBER = "number",
    STRING = "string",
    DATE = "date",
    BOOLEAN = "boolean",
    FILE= "file"
}