import { useState } from 'react'
import { Loader2, Mail, ShieldAlert, Trash2 } from '@/components/ui/icons'
import { z } from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { createAccountDeletionRequest } from '@/lib/support-api'

const accountDeletionSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email.')
    .email('Enter a valid email address.'),
  reason: z
    .string()
    .trim()
    .min(10, 'Please share a short reason so our team has enough context.')
    .max(2000, 'Please keep your reason under 2000 characters.'),
})

export function AccountDeletionRequestForm() {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    reason?: string
  }>({})
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmissionMessage(null)
    setIsSubmitted(false)

    const parsed = accountDeletionSchema.safeParse({
      email,
      reason,
    })

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldErrors({
        email: flattened.email?.[0],
        reason: flattened.reason?.[0],
      })
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const response = await createAccountDeletionRequest(parsed.data)
      setIsSubmitted(true)
      setSubmissionMessage(
        `Request received. We shall reach out within ${response.data.expectedResponseTimeHours} hours.`,
      )
      setEmail('')
      setReason('')
    } catch (error) {
      const fallbackMessage =
        error instanceof Error
          ? error.message
          : 'We could not submit your request right now. Please try again.'

      setSubmissionMessage(fallbackMessage)
      setIsSubmitted(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="rounded-4xl border-border/70 bg-card/95 shadow-[0_28px_90px_rgba(18,18,18,0.08)]">
      <CardHeader className="space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Trash2 className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <CardTitle className="font-serif text-3xl tracking-tight text-foreground">
            Request account deletion
          </CardTitle>
          <CardDescription className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Enter the email linked to your Picsa account and a short note about your
            request. Our team will review it and reach out within 48 hours.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 rounded-2xl border border-border/70 bg-secondary/30 p-5 sm:grid-cols-3">
          {[
            {
              icon: Mail,
              title: 'Use your account email',
              body: 'Send the request from the email address connected to the account you want removed.',
            },
            {
              icon: ShieldAlert,
              title: 'We review each request',
              body: 'This helps us protect accounts from accidental or unauthorized deletion requests.',
            },
            {
              icon: Trash2,
              title: 'Simple process',
              body: 'Once reviewed, our team will guide you through the remaining deletion steps.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/70 bg-background/80 p-4"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Account email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
            />
            {fieldErrors.email ? (
              <p className="text-sm text-destructive">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="reason">
              Reason
            </label>
            <Textarea
              id="reason"
              rows={6}
              placeholder="Tell us why you want your account deleted and anything we should know before we contact you."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              aria-invalid={fieldErrors.reason ? 'true' : 'false'}
            />
            {fieldErrors.reason ? (
              <p className="text-sm text-destructive">
                {fieldErrors.reason}
              </p>
            ) : null}
          </div>

          {submissionMessage ? (
            <Alert
              className={cn(
                isSubmitted
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                  : undefined,
              )}
              variant={isSubmitted ? 'default' : 'destructive'}
            >
              <AlertTitle>{isSubmitted ? 'Request sent' : 'Something went wrong'}</AlertTitle>
              <AlertDescription>{submissionMessage}</AlertDescription>
            </Alert>
          ) : null}

          <CardFooter className="px-0 pt-2">
            <Button
              type="submit"
              size="lg"
              className="rounded-full px-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending request
                </>
              ) : (
                'Submit request'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
