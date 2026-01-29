'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { revokeCertificate } from '@/lib/services/certificates'
import { Protected } from '@/components/shared/Protected'

interface RevokeCertificateFormProps {
  certificateId: string
}

export function RevokeCertificateForm({ certificateId }: RevokeCertificateFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRevoke = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for revoking this certificate',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Get current user ID for revokedBy
      const userId = 'current-user-id' // Replace with actual user ID

      await revokeCertificate(certificateId, userId, reason)

      toast({
        title: 'Certificate Revoked',
        description: 'The certificate has been revoked successfully',
      })

      // Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      console.error('Error revoking certificate:', error)
      toast({
        title: 'Error',
        description: 'Failed to revoke certificate',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Protected anyPermissions={['admin.manage', 'certificates.revoke']}>
      <div className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            This action cannot be undone. The certificate will be permanently revoked and the
            associated digital badge will also be revoked.
          </p>
        </div>

        <div>
          <Label htmlFor="reason">Reason for Revocation *</Label>
          <Textarea
            id="reason"
            placeholder="Provide a detailed reason for revoking this certificate..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>

        <Button
          variant="default"
          onClick={handleRevoke}
          disabled={isSubmitting || !reason.trim()}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isSubmitting ? 'Revoking...' : 'Revoke Certificate'}
        </Button>
      </div>
    </Protected>
  )
}
