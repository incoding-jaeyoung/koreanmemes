'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, Link, Languages } from 'lucide-react'
import React from 'react'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  currentImage?: string
  onRemoveImage: () => void
}

export function ImageUpload({ onImageUploaded, currentImage, onRemoveImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [translateEnabled, setTranslateEnabled] = useState(false)
  const [manualTranslateEnabled, setManualTranslateEnabled] = useState(false)
  const [noTranslateEnabled, setNoTranslateEnabled] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    
    try {
      // 수동 번역 모드인 경우
      if (manualTranslateEnabled) {
        setSelectedFile(file)
        setShowEditor(true)
        setIsUploading(false)
        return
      }

      // 자동 번역 또는 일반 업로드 (번역 없이 업로드 포함)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('translateImage', translateEnabled.toString())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        onImageUploaded(result.imageUrl)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // 수동 번역 완료 핸들러
  const handleManualTranslationComplete = (translatedImageUrl: string) => {
    onImageUploaded(translatedImageUrl)
    setShowEditor(false)
    setSelectedFile(null)
  }

  // 수동 번역 취소 핸들러
  const handleManualTranslationCancel = () => {
    setShowEditor(false)
    setSelectedFile(null)
    setIsUploading(false)
  }

  // 자동/수동/번역없이 전환 시 초기화
  const handleTranslateToggle = (enabled: boolean) => {
    setTranslateEnabled(enabled)
    if (enabled) {
      setManualTranslateEnabled(false)
      setNoTranslateEnabled(false)
    }
  }

  const handleManualTranslateToggle = (enabled: boolean) => {
    setManualTranslateEnabled(enabled)
    if (enabled) {
      setTranslateEnabled(false)
      setNoTranslateEnabled(false)
    }
  }

  const handleNoTranslateToggle = (enabled: boolean) => {
    setNoTranslateEnabled(enabled)
    if (enabled) {
      setTranslateEnabled(false)
      setManualTranslateEnabled(false)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageUploaded(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // 수동 번역 편집기가 활성화된 경우
  if (showEditor && selectedFile) {
    const ImageTranslator = React.lazy(() => import('./ImageTranslator'))
    
    return (
      <React.Suspense fallback={<div className="text-center py-8">Loading editor...</div>}>
        <ImageTranslator
          imageFile={selectedFile}
          onTranslationComplete={handleManualTranslationComplete}
          onCancel={handleManualTranslationCancel}
        />
      </React.Suspense>
    )
  }

  if (currentImage) {
    return (
      <div className="relative">
        <img 
          src={currentImage} 
          alt="Uploaded preview" 
          className="w-full max-w-md h-48 object-cover rounded-lg border"
        />
        <button
          type="button"
          onClick={onRemoveImage}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* 번역 옵션들 */}
      <div className="space-y-3">
        {/* 번역 없이 업로드 */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">No Translation</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={noTranslateEnabled}
              onChange={(e) => handleNoTranslateToggle(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              noTranslateEnabled ? 'bg-gray-600' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                noTranslateEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </label>
          <span className="text-xs text-gray-700">
            {noTranslateEnabled ? 'Upload original image as-is' : 'Original image upload disabled'}
          </span>
        </div>

        {/* 자동 번역 */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Auto Translation</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={translateEnabled}
              onChange={(e) => handleTranslateToggle(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              translateEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                translateEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </label>
          <span className="text-xs text-blue-700">
            {translateEnabled ? 'Korean text will be auto-translated' : 'Upload original image'}
          </span>
        </div>

        {/* 수동 번역 */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 text-green-600">🎯</div>
            <span className="text-sm font-medium text-green-900">Manual Translation</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={manualTranslateEnabled}
              onChange={(e) => handleManualTranslateToggle(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              manualTranslateEnabled ? 'bg-green-600' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                manualTranslateEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </label>
          <span className="text-xs text-green-700">
            {manualTranslateEnabled ? 'Select text areas manually' : 'Drag to select text areas'}
          </span>
        </div>
      </div>
      
      {/* 파일 업로드 영역 */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">
              {translateEnabled ? 'Translating and uploading...' : 
               manualTranslateEnabled ? 'Opening editor...' : 'Uploading...'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Upload className="h-8 w-8" />
              <ImageIcon className="h-8 w-8" />
              {translateEnabled && <Languages className="h-8 w-8 text-blue-500" />}
              {manualTranslateEnabled && <div className="h-8 w-8 text-green-500">🎯</div>}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
                {translateEnabled && (
                  <span className="block text-blue-600 font-medium">
                    🇰🇷 Korean text will be auto-translated to English
                  </span>
                )}
                {manualTranslateEnabled && (
                  <span className="block text-green-600 font-medium">
                    🎯 Select text areas manually with canvas editor
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* URL 입력 옵션 */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
        >
          <Link className="h-4 w-4" />
          또는 이미지 URL 직접 입력
        </button>
        
        {showUrlInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://picsum.photos/600/400"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 