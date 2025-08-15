type ITab = {
  label: string
  icon: React.ElementType
  active: boolean
  onClick: () => void
}
const TabButton = (tab: ITab) => (
  <button
    className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold shadow-lg transition hover:bg-primary hover:text-card ${
      tab.active
        ? 'border-primary text-primary'
        : 'border-transparent text-popover-foreground'
    }`}
    onClick={tab.onClick}
  >
    <tab.icon className="h-4 w-4" /> {tab.label}
  </button>
)
export { TabButton }
