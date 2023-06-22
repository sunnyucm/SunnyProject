import * as React from 'react'

const SidebarContext = React.createContext<
  | {
      open: boolean
      toggleOpen: () => void
    }
  | undefined
>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  const toggleOpen = () => setOpen((open) => !open)

  return (
    <SidebarContext.Provider value={{ open, toggleOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('`useSidebar()` must be used within a <SidebarProvider />')
  }

  return context
}
