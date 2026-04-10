import { useLocation } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Fragment } from 'react'

const pathLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  orders: 'Orders',
  products: 'Products',
  notifications: 'Notifications',
  tickets: 'Tickets',
  settings: 'Settings',
  'audit-log': 'Audit Log',
}

export function BreadcrumbNav() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/')
          const isLast = index === segments.length - 1
          const label = pathLabels[segment] || segment

          return (
            <Fragment key={segment}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
