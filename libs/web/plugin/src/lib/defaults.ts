import { PluginType } from './i-plugin'

export const allPlugins = ['chargebacks', 'preorder', 'escrow']

export const pluginTypes: Record<string, PluginType> = {
  chargebacks: {
    name: 'chargebacks',
    selectId: 'chargebacks-select',
    arrowPosition: '140px',
  },
  preorder: {
    name: 'preorder',
    selectId: 'preorder-select',
    arrowPosition: '208px',
  },
  escrow: {
    name: 'escrow',
    selectId: 'escrow-select',
    arrowPosition: '326px',
  },
}
