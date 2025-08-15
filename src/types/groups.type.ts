export type IGroup = {
  id: string
  name: string
}
export type IUserGroup = {
  id: string
  name: string
  email: string
  company: string
}

export enum GroupEnum {
  ENGENHA_DEV = 'EngenhaDev',
  GESTAO_CONTRATOS = 'Gestão de Contratos',
  VENDAS = 'Vendas',
  SUPRIMENTOS = 'Suprimentos',
  ENGENHARIA = 'Engenharia',
  ALMOXARIFADO = 'Almoxarifado',
  INSPECAO = 'Inspeção',
  EXPEDICAO = 'Expedição',
  PRODUCAO = 'Produção',
}
