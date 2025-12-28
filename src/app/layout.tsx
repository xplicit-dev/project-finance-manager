import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { CurrencyProvider } from '@/contexts/CurrencyProvider'

export const metadata: Metadata = {
  title: 'Project Finance Manager',
  description: 'Manage project finances, invoices, payments, and employee payouts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CurrencyProvider>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main 
              style={{ 
                flex: 1, 
                padding: '2rem',
              }}
              className="main-content"
            >
              {children}
            </main>
          </div>
        </CurrencyProvider>
      </body>
    </html>
  )
}
