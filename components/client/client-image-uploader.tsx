'use client'

import { useRef, useState } from 'react'
import { ImagePlusIcon, UploadCloudIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ClientImageUploader({
  onUpload,
  disabled,
  maxFiles,
}: {
  onUpload: (files: File[]) => Promise<void>
  disabled?: boolean
  maxFiles?: number
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || disabled) {
      return
    }

    const files = Array.from(fileList).slice(0, maxFiles ?? fileList.length)
    await onUpload(files)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn(
        'rounded-[1.5rem] border border-dashed border-border/80 bg-secondary/40 p-6 text-center transition-colors',
        isDragging && 'border-accent bg-accent/10',
      )}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={async (event) => {
        event.preventDefault()
        setIsDragging(false)
        await handleFiles(event.dataTransfer.files)
      }}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background text-accent shadow-sm">
          <UploadCloudIcon className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <p className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Drop images here
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Upload directly from your laptop, or open the picker to add a curated batch to the gallery.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ImagePlusIcon className="mr-2 h-4 w-4" />
            Choose images
          </Button>
          {maxFiles ? (
            <p className="self-center text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Up to {maxFiles} files
            </p>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={async (event) => handleFiles(event.target.files)}
      />
    </div>
  )
}
