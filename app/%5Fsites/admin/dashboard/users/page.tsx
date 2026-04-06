'use client'

import { useDeferredValue, useEffect, useMemo } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  EyeIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCogIcon,
} from '@/components/ui/icons'
import { toast } from 'sonner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import {
  type AdminUserDetail,
  type AdminUserRoleValue,
  type AdminUsersQueryInput,
  type AdminUserSummary,
  getAdminUserById,
  listAdminUsers,
  syncAdminUserSubscription,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '@/lib/admin-users-api'
import { isAdminApiError } from '@/lib/api'
import {
  adminUsersActionAtom,
  adminUsersActionReasonAtom,
  adminUsersPageAtom,
  adminUsersProFilterAtom,
  adminUsersRoleFilterAtom,
  adminUsersSearchInputAtom,
  adminUsersSelectedUserIdAtom,
  adminUsersSortByAtom,
  adminUsersSortOrderAtom,
  adminUsersStatusFilterAtom,
  type ProFilterValue,
  type RoleFilterValue,
  type StatusFilterValue,
  type UserActionState,
} from '@/lib/users-page-state'
import { PageHeader } from '@/components/common/page-header'
import { StatusBadge } from '@/components/common/status-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

const USERS_QUERY_KEY = 'admin-users'
const USER_QUERY_KEY = 'admin-user'
const USERS_PAGE_SIZE = 20

function formatDate(value: string | null) {
  if (!value) {
    return 'Never'
  }

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Never'
  }

  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getUserDisplayName(user: Pick<AdminUserSummary, 'name' | 'email'>) {
  const name = user.name?.trim()

  if (name) {
    return name
  }

  return user.email?.split('@')[0] ?? 'Unnamed User'
}

function getUserInitials(user: Pick<AdminUserSummary, 'name' | 'email'>) {
  const displayName = getUserDisplayName(user)
  const parts = displayName.split(/\s+/).filter(Boolean)

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'
}

function getRoleLabel(role: AdminUserRoleValue) {
  return role === 'admin' ? 'Admin' : 'User'
}

function getStatusLabel(user: AdminUserSummary) {
  return user.active ? 'active' : 'inactive'
}

function buildQueryInput(query: {
  page: number
  limit: number
  search: string
  role: RoleFilterValue
  status: StatusFilterValue
  pro: ProFilterValue
  sortBy: AdminUsersQueryInput['sortBy']
  sortOrder: AdminUsersQueryInput['sortOrder']
}): AdminUsersQueryInput {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search || undefined,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    role: query.role === 'all' ? undefined : query.role,
    active:
      query.status === 'all'
        ? undefined
        : query.status === 'active',
    pro:
      query.pro === 'all'
        ? undefined
        : query.pro === 'pro',
  }
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { bootstrapStatus, isAuthenticated, performAuthenticatedRequest } = useAdminAuth()
  const [searchInput, setSearchInput] = useAtom(adminUsersSearchInputAtom)
  const deferredSearch = useDeferredValue(searchInput.trim())
  const [page, setPage] = useAtom(adminUsersPageAtom)
  const [roleFilter, setRoleFilter] = useAtom(adminUsersRoleFilterAtom)
  const [statusFilter, setStatusFilter] = useAtom(adminUsersStatusFilterAtom)
  const [proFilter, setProFilter] = useAtom(adminUsersProFilterAtom)
  const [sortBy, setSortBy] = useAtom(adminUsersSortByAtom)
  const [sortOrder, setSortOrder] = useAtom(adminUsersSortOrderAtom)
  const [selectedUserId, setSelectedUserId] = useAtom(adminUsersSelectedUserIdAtom)
  const [userAction, setUserAction] = useAtom(adminUsersActionAtom)
  const [actionReason, setActionReason] = useAtom(adminUsersActionReasonAtom)
  const clearActionReason = useSetAtom(adminUsersActionReasonAtom)

  useEffect(() => {
    setPage(1)
  }, [deferredSearch, roleFilter, statusFilter, proFilter, sortBy, sortOrder])

  const queryInput = useMemo(
    () =>
      buildQueryInput({
        page,
        limit: USERS_PAGE_SIZE,
        search: deferredSearch,
        role: roleFilter,
        status: statusFilter,
        pro: proFilter,
        sortBy,
        sortOrder,
      }),
    [deferredSearch, page, proFilter, roleFilter, sortBy, sortOrder, statusFilter],
  )

  const usersQuery = useQuery({
    queryKey: [USERS_QUERY_KEY, queryInput],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        listAdminUsers(accessToken, queryInput),
      ),
    enabled: bootstrapStatus === 'ready' && isAuthenticated,
    placeholderData: (previousData) => previousData,
  })

  const selectedUserQuery = useQuery({
    queryKey: [USER_QUERY_KEY, selectedUserId],
    queryFn: () =>
      performAuthenticatedRequest((accessToken) =>
        getAdminUserById(accessToken, selectedUserId!),
      ),
    enabled: Boolean(
      selectedUserId &&
        bootstrapStatus === 'ready' &&
        isAuthenticated,
    ),
  })

  const refreshUsers = async () => {
    try {
      await usersQuery.refetch()
      toast.success('Users refreshed')
    } catch (error) {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to refresh users'
      toast.error(message)
    }
  }

  const roleMutation = useMutation({
    mutationFn: async (input: {
      userId: string
      role: AdminUserRoleValue
      reason: string
    }) =>
      performAuthenticatedRequest((accessToken) =>
        updateAdminUserRole(accessToken, input.userId, {
          role: input.role,
          reason: input.reason,
        }),
      ),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, variables.userId] }),
      ])
      setUserAction(null)
      clearActionReason('')
      toast.success('User role updated')
    },
    onError: (error) => {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to update role'
      toast.error(message)
    },
  })

  const statusMutation = useMutation({
    mutationFn: async (input: {
      userId: string
      active: boolean
      reason: string
    }) =>
      performAuthenticatedRequest((accessToken) =>
        updateAdminUserStatus(accessToken, input.userId, {
          active: input.active,
          reason: input.reason,
        }),
      ),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, variables.userId] }),
      ])
      setUserAction(null)
      clearActionReason('')
      toast.success(`User ${variables.active ? 'activated' : 'deactivated'}`)
    },
    onError: (error) => {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to update status'
      toast.error(message)
    },
  })

  const syncMutation = useMutation({
    mutationFn: async (userId: string) =>
      performAuthenticatedRequest((accessToken) =>
        syncAdminUserSubscription(accessToken, userId),
      ),
    onSuccess: async (_, userId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, userId] }),
      ])
      toast.success('Subscription synced')
    },
    onError: (error) => {
      const message =
        isAdminApiError(error) || error instanceof Error
          ? error.message
          : 'Unable to sync subscription'
      toast.error(message)
    },
  })

  const users = usersQuery.data?.data.items ?? []
  const totalCount = usersQuery.data?.data.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / USERS_PAGE_SIZE))
  const selectedUser = selectedUserQuery.data?.data.user ?? null

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const canSubmitAction = actionReason.trim().length >= 3
  const actionIsLoading = roleMutation.isPending || statusMutation.isPending

  const handleConfirmAction = async () => {
    if (!userAction || !canSubmitAction) {
      return
    }

    if (userAction.type === 'role') {
      await roleMutation.mutateAsync({
        userId: userAction.user.id,
        role: userAction.nextRole,
        reason: actionReason.trim(),
      })
      return
    }

    await statusMutation.mutateAsync({
      userId: userAction.user.id,
      active: userAction.nextActive,
      reason: actionReason.trim(),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage admin access, user status, and subscription visibility."
        actions={
          <Button variant="outline" onClick={() => void refreshUsers()} disabled={usersQuery.isFetching}>
            {usersQuery.isFetching ? <Spinner className="mr-2 size-4" /> : <RefreshCwIcon className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        }
      />

      <Card className="border-border/70 bg-card/80 p-4 shadow-none">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-xl">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, email, or user id"
                className="h-11 rounded-xl border-border/70 bg-background pl-10 shadow-none"
              />
            </div>
            <div className="inline-flex items-center rounded-full border border-border/70 bg-muted/35 px-3 py-1.5 text-sm text-muted-foreground">
              Showing <span className="mx-1 font-semibold text-foreground">{users.length}</span> of{' '}
              <span className="mx-1 font-semibold text-foreground">{totalCount}</span> users
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Filter
              </span>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilterValue)}>
                <SelectTrigger className="h-10 w-[150px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilterValue)}>
                <SelectTrigger className="h-10 w-[160px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={proFilter} onValueChange={(value) => setProFilter(value as ProFilterValue)}>
                <SelectTrigger className="h-10 w-[145px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="pro">Pro users</SelectItem>
                  <SelectItem value="free">Free users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Sort
              </span>
              <Select
                value={sortBy ?? 'createdAt'}
                onValueChange={(value) => setSortBy(value as NonNullable<AdminUsersQueryInput['sortBy']>)}
              >
                <SelectTrigger className="h-10 w-[165px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Joined date</SelectItem>
                  <SelectItem value="updatedAt">Updated date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortOrder ?? 'DESC'}
                onValueChange={(value) => setSortOrder(value as NonNullable<AdminUsersQueryInput['sortOrder']>)}
              >
                <SelectTrigger className="h-10 w-[155px] rounded-full border-border/70 bg-background shadow-none">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESC">Newest first</SelectItem>
                  <SelectItem value="ASC">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        {usersQuery.isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="size-6" />
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          </div>
        ) : usersQuery.isError ? (
          <div className="flex min-h-80 items-center justify-center px-6 text-center">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Unable to load users</h2>
                <p className="text-sm text-muted-foreground">
                  {isAdminApiError(usersQuery.error) || usersQuery.error instanceof Error
                    ? usersQuery.error.message
                    : 'Something went wrong while loading the user list.'}
                </p>
              </div>
              <Button onClick={() => void usersQuery.refetch()}>Try again</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                        No users matched your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 text-left"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.url ?? undefined} />
                              <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="font-medium">{getUserDisplayName(user)}</p>
                              <p className="text-sm text-muted-foreground">{user.email ?? 'No email address'}</p>
                            </div>
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getStatusLabel(user)} />
                        </TableCell>
                        <TableCell>
                          {user.pro ? (
                            <Badge className="gap-1">
                              <SparklesIcon className="h-3.5 w-3.5" />
                              Pro
                            </Badge>
                          ) : (
                            <Badge variant="outline">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(user.lastLoginAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedUserId(user.id)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  clearActionReason('')
                                  setUserAction({
                                    type: 'role',
                                    user,
                                    nextRole: user.role === 'admin' ? 'user' : 'admin',
                                  })
                                }}
                              >
                                <ShieldCheckIcon className="mr-2 h-4 w-4" />
                                {user.role === 'admin' ? 'Make regular user' : 'Make admin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  clearActionReason('')
                                  setUserAction({
                                    type: 'status',
                                    user,
                                    nextActive: !user.active,
                                  })
                                }}
                              >
                                <UserCogIcon className="mr-2 h-4 w-4" />
                                {user.active ? 'Deactivate user' : 'Activate user'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={syncMutation.isPending}
                                onClick={() => syncMutation.mutate(user.id)}
                              >
                                <RefreshCwIcon className="mr-2 h-4 w-4" />
                                Sync subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || usersQuery.isFetching}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || usersQuery.isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Sheet open={Boolean(selectedUserId)} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>User details</SheetTitle>
            <SheetDescription>
              Review account information, subscription state, and recent activity counts.
            </SheetDescription>
          </SheetHeader>

          {selectedUserQuery.isLoading ? (
            <div className="mt-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Spinner className="size-6" />
                <p className="text-sm text-muted-foreground">Loading user details...</p>
              </div>
            </div>
          ) : selectedUserQuery.isError ? (
            <div className="mt-10 rounded-lg border border-dashed p-6 text-center">
              <p className="font-medium">Unable to load user details</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAdminApiError(selectedUserQuery.error) || selectedUserQuery.error instanceof Error
                  ? selectedUserQuery.error.message
                  : 'Something went wrong while loading this user.'}
              </p>
            </div>
          ) : selectedUser ? (
            <UserDetailContent user={selectedUser} onSync={() => syncMutation.mutate(selectedUser.id)} isSyncing={syncMutation.isPending} />
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={Boolean(userAction)} onOpenChange={(open) => !open && setUserAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userAction?.type === 'role'
                ? 'Update user role'
                : userAction?.nextActive
                  ? 'Activate user'
                  : 'Deactivate user'}
            </DialogTitle>
            <DialogDescription>
              {userAction?.type === 'role'
                ? 'Choose the role this user should have moving forward.'
                : userAction?.nextActive
                  ? 'Re-enable account access for this user.'
                  : 'Disable access for this user until they are reactivated.'}
            </DialogDescription>
          </DialogHeader>

          {userAction ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="font-medium">{getUserDisplayName(userAction.user)}</p>
                <p className="text-sm text-muted-foreground">{userAction.user.email ?? 'No email address'}</p>
              </div>

              {userAction.type === 'role' ? (
                <div className="space-y-2">
                  <Label htmlFor="next-role">Role</Label>
                  <Select
                    value={userAction.nextRole}
                    onValueChange={(value) =>
                      setUserAction({
                        ...userAction,
                        nextRole: value as AdminUserRoleValue,
                      })
                    }
                  >
                    <SelectTrigger id="next-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={actionReason}
                  onChange={(event) => setActionReason(event.target.value)}
                  placeholder="Add a short reason for this change"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This reason is stored in the audit trail.
                </p>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserAction(null)} disabled={actionIsLoading}>
              Cancel
            </Button>
            <Button onClick={() => void handleConfirmAction()} disabled={!canSubmitAction || actionIsLoading}>
              {actionIsLoading ? <Spinner className="mr-2 size-4" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserDetailContent({
  user,
  onSync,
  isSyncing,
}: {
  user: AdminUserDetail
  onSync: () => void
  isSyncing: boolean
}) {
  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.url ?? undefined} />
          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{getUserDisplayName(user)}</h3>
            <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
            {user.pro ? (
              <Badge className="gap-1">
                <SparklesIcon className="h-3.5 w-3.5" />
                Pro
              </Badge>
            ) : (
              <Badge variant="outline">Free</Badge>
            )}
            <StatusBadge status={getStatusLabel(user)} />
          </div>
          <p className="text-sm text-muted-foreground">{user.email ?? 'No email address'}</p>
          <p className="text-xs text-muted-foreground">User ID: {user.id}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailMetric label="Joined" value={formatDateTime(user.createdAt)} />
        <DetailMetric label="Last login" value={formatDateTime(user.lastLoginAt)} />
        <DetailMetric label="Email verified" value={user.emailVerifiedAt ? formatDateTime(user.emailVerifiedAt) : 'Not verified'} />
        <DetailMetric label="Auth providers" value={user.authProviders.length > 0 ? user.authProviders.join(', ') : 'None'} />
      </div>

      <Separator />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Subscription</h4>
            <p className="text-sm text-muted-foreground">Mirrored RevenueCat state for this account.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onSync} disabled={isSyncing}>
            {isSyncing ? <Spinner className="mr-2 size-4" /> : <RefreshCwIcon className="mr-2 h-4 w-4" />}
            Sync
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailMetric label="Product" value={user.subscription.activeProductId ?? 'No active product'} />
          <DetailMetric label="Store" value={user.subscription.store ?? 'Unknown'} />
          <DetailMetric label="Will renew" value={user.subscription.willRenew ? 'Yes' : 'No'} />
          <DetailMetric label="Expires at" value={user.subscription.expiresAt ? formatDateTime(user.subscription.expiresAt) : 'Not set'} />
          <DetailMetric label="Last synced" value={user.subscription.lastSyncedAt ? formatDateTime(user.subscription.lastSyncedAt) : 'Never'} />
          <DetailMetric
            label="Active entitlements"
            value={
              user.subscription.activeEntitlementIds.length > 0
                ? user.subscription.activeEntitlementIds.join(', ')
                : 'None'
            }
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <div>
          <h4 className="font-medium">Counts</h4>
          <p className="text-sm text-muted-foreground">Current usage and inbox visibility for this user.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailMetric label="Hosted events" value={String(user.counts.hostedEventsCount)} />
          <DetailMetric label="Joined events" value={String(user.counts.memberEventsCount)} />
          <DetailMetric label="Images" value={String(user.counts.imageCount)} />
          <DetailMetric label="Unread notifications" value={String(user.counts.unreadNotificationCount)} />
        </div>
      </section>
    </div>
  )
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  )
}
