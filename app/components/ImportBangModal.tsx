"use client"

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface ImportBangModalProps {
  onClose: () => void
  onImport: (key: string, url: string) => void
}

interface ConfirmDialogProps {
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

function decodeBangCode(code: string) {
  try {
    // First try to parse as raw key|url format
    if (code.includes('|')) {
      const [key, url] = code.split('|', 2)
      if (!key || !url) {
        throw new Error('Invalid bang configuration')
      }
      return { key, url }
    }

    // If not raw format, try base64 decode
    const decoded = atob(code)
    const [key, url] = decoded.split('|', 2)
    if (!key || !url) {
      throw new Error('Invalid bang configuration')
    }
    return { key, url }
  } catch (error) {
    return null
  }
}

export function ImportBangModal({ onClose, onImport }: ImportBangModalProps) {
  const [bangCode, setBangCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleImport = () => {
    const decoded = decodeBangCode(bangCode)
    if (!decoded) {
      setError("Invalid bang code. Please check the code and try again.")
      return
    }
    onImport(decoded.key, decoded.url)
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="import-dialog-title"
      aria-describedby="import-dialog-description"
    >
      <div
        ref={modalRef}
        className="bg-surface rounded-lg p-6 max-w-lg w-full mx-4"
        role="document"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="import-dialog-title" className="text-2xl text-primary bangers">Import Bang</h2>
          <button
            onClick={onClose}
            className="text-text hover:text-text-light focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p id="import-dialog-description" className="text-text-light mb-4">
          Paste a bang code to import it into your collection. You can get bang codes by clicking the "Share" button next to any bang.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="bang-code" className="block text-sm font-medium text-text mb-1">
              Bang Code
            </label>
            <input
              ref={inputRef}
              type="text"
              id="bang-code"
              value={bangCode}
              onChange={(e) => {
                setBangCode(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleImport()
                }
              }}
              className="w-full border border-primary-light p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Paste bang code here..."
            />
            {error && (
              <p className="mt-2 text-sm text-primary" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-text hover:text-text-light transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ onClose, onConfirm, title, message }: ConfirmDialogProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  useEffect(() => {
    confirmButtonRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div
        ref={modalRef}
        className="bg-surface rounded-lg p-6 max-w-lg w-full mx-4"
        role="document"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="confirm-dialog-title" className="text-2xl text-primary bangers">{title}</h2>
          <button
            onClick={onClose}
            className="text-text hover:text-text-light focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p id="confirm-dialog-message" className="text-text-light mb-4">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text hover:text-text-light transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
