'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { rcTransactions } from '@/lib/mock-data'
import { ArrowRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const transactionTypeLabel: Record<string, string> = {
  initial_purchase: 'New',
  renewal: 'Renewal',
  product_change: 'Upgrade',
  cancellation: 'Cancelled',
  refund: 'Refund',
}

const transactionTypeVariant: Record<string, string> = {
  initial_purchase: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  renewal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  product_change: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  cancellation: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  refund: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export function RecentTransactions() {
  const recent = rcTransactions.slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest RevenueCat payment events</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/payments">
            View all
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscriber</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={txn.subscriberAvatar} />
                      <AvatarFallback>
                        {txn.subscriberName.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm">{txn.subscriberName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{txn.productName}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      transactionTypeVariant[txn.type],
                    )}
                  >
                    {transactionTypeLabel[txn.type]}
                  </span>
                </TableCell>
                <TableCell className={cn(
                  'text-right font-medium tabular-nums',
                  txn.amount < 0 ? 'text-red-600' : '',
                )}>
                  {txn.amount === 0
                    ? 'Free'
                    : `${txn.amount < 0 ? '-' : ''}$${Math.abs(txn.amount).toFixed(2)}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
