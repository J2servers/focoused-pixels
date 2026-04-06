/**
 * Padronização de botões do admin.
 * REGRAS:
 * - CYAN:   Adicionar / Criar
 * - RED:    Deletar / Excluir / Apagar (com ícone Trash2, texto "Deletar")
 * - YELLOW: Editar / Testar
 * - PURPLE: Visualizar / Importar / Exibir
 * - GREEN:  Salvar / Enviar / Instalar / Prosseguir
 * - DEEP ORANGE: Switch toggles
 */

export const BTN = {
  create: 'admin-btn admin-btn-create',
  delete: 'admin-btn admin-btn-delete',
  edit:   'admin-btn admin-btn-edit',
  view:   'admin-btn admin-btn-view',
  save:   'admin-btn admin-btn-save',
  switchClass: 'admin-switch-orange',
} as const;
