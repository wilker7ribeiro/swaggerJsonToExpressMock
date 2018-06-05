export class PathParam {
    nome: string;
    obrigatorio: boolean;
    tipo: PathParamTipo;
    descricao: string;
}

export enum PathParamTipo {
    NUMBER = "number",
    STRING = "string"
}