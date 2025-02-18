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
  const [importCode, setImportCode] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleImport = () => {
    if (!importCode) {
      toast.error("Please enter a bang code", {
        className: "bg-red-500 text-white border-red-600"
      })
      return
    }

    const bangConfig = decodeBangCode(importCode)
    if (!bangConfig) {
      toast.error("Invalid bang code", {
        description: "The code you entered is not a valid bang configuration.",
        className: "bg-red-500 text-white border-red-600"
      })
      return
    }

    onImport(bangConfig.key, bangConfig.url)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
        role="document"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="import-modal-title" className="text-2xl text-blue-500 bangers">Import Bang</h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Paste a bang code below to import it into your custom bangs.
        </p>
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Paste bang code here"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Bang code"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-800 hover:text-gray-900 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
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
    // Focus confirm button on mount
    confirmButtonRef.current?.focus()

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
        role="document"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="confirm-dialog-title" className="text-2xl text-blue-500 bangers">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p id="confirm-dialog-message" className="text-gray-600 mb-4">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-800 hover:text-gray-900 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
