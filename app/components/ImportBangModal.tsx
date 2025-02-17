"use client"

import { useState } from 'react'
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
    const bangConfig = JSON.parse(atob(code))
    if (!bangConfig.key || !bangConfig.url) {
      throw new Error('Invalid bang configuration')
    }
    return bangConfig
  } catch (error) {
    return null
  }
}

export function ImportBangModal({ onClose, onImport }: ImportBangModalProps) {
  const [importCode, setImportCode] = useState("")

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-blue-500 bangers">Import Bang</h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Paste a bang code below to import it into your custom bangs.
        </p>
        <div className="space-y-4">
          <input
            type="text"
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Paste bang code here"
            className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-800 hover:text-gray-900 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl text-blue-500 bangers">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-800 hover:text-gray-900 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
