'use client'

import { useState, useRef, DragEvent, useEffect } from 'react'
import { Image as ImageIcon, Loader2, Plus, Edit3, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import React from 'react'

interface UploadedImage {
  id: string
  url: string
  file?: File
  isEditing?: boolean
}

interface MultipleImageUploadProps {
  onImagesChange: (images: string[]) => void
  currentImages?: string[]
  maxImages?: number
}

export function MultipleImageUpload({ onImagesChange, currentImages = [], maxImages = 5 }: MultipleImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [editingImage, setEditingImage] = useState<File | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 초기 이미지 설정을 useEffect로 이동
  useEffect(() => {
    if (currentImages.length > 0 && !isInitialized) {
      const initialImages = currentImages.map((url, index) => ({ 
        id: `existing-${index}`, 
        url 
      }))
      setImages(initialImages)
      setIsInitialized(true)
    } else if (currentImages.length === 0 && !isInitialized) {
      // 초기 이미지가 없어도 초기화 완료로 표시
      setIsInitialized(true)
    }
  }, [currentImages, isInitialized])

  // 이미지 상태가 변경될 때마다 부모에게 알림 (useEffect 사용으로 렌더링 에러 방지)
  useEffect(() => {
    if (isInitialized) {
      const imageUrls = images.map(img => img.url)
      console.log('=== useEffect 이미지 변경 알림 ===')
      console.log('현재 images:', images)
      console.log('추출된 URLs:', imageUrls)
      onImagesChange(imageUrls)
    }
  }, [images, isInitialized, onImagesChange])

  const handleFileUpload = async (files: FileList | File[]) => {
    if (images.length >= maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`)
      return
    }

    setIsUploading(true)
    
    try {
      const fileArray = Array.from(files)
      const availableSlots = maxImages - images.length
      const filesToUpload = fileArray.slice(0, availableSlots)

      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('translateImage', 'false') // 기본적으로 원본 이미지 업로드

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()
        
        if (result.success) {
          const newImage: UploadedImage = {
            id: `img-${Date.now()}-${Math.random()}`,
            url: result.imageUrl,
            file: file
          }
          
          setImages(prev => {
            const updated = [...prev, newImage]
            // 직접 알림 제거 - useEffect가 처리함
            return updated
          })
        } else {
          throw new Error(result.error || 'Upload failed')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      // 직접 알림 제거 - useEffect가 처리함
      return updated
    })
  }

  const handleEditImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId)
    if (image && image.file) {
      setEditingImage(image.file)
      setEditingImageId(imageId)
    } else {
      alert('이 이미지는 편집할 수 없습니다. (원본 파일이 없음)')
    }
  }

  // 순서 변경 함수
  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const updated = [...prev]
      const [movedImage] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, movedImage)
      // 직접 알림 제거 - useEffect가 처리함
      return updated
    })
  }

  // 화살표 버튼으로 순서 변경
  const handleMoveUp = (imageId: string) => {
    const currentIndex = images.findIndex(img => img.id === imageId)
    if (currentIndex > 0) {
      moveImage(currentIndex, currentIndex - 1)
    }
  }

  const handleMoveDown = (imageId: string) => {
    const currentIndex = images.findIndex(img => img.id === imageId)
    if (currentIndex < images.length - 1) {
      moveImage(currentIndex, currentIndex + 1)
    }
  }

  // 드래그 앤 드롭 이벤트 핸들러들
  const handleImageDragStart = (e: React.DragEvent, imageId: string) => {
    setDraggedImageId(imageId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleImageDragOver = (e: React.DragEvent, imageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverImageId(imageId)
  }

  const handleImageDragLeave = () => {
    setDragOverImageId(null)
  }

  const handleImageDrop = (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault()
    
    if (draggedImageId && draggedImageId !== targetImageId) {
      const fromIndex = images.findIndex(img => img.id === draggedImageId)
      const toIndex = images.findIndex(img => img.id === targetImageId)
      
      if (fromIndex !== -1 && toIndex !== -1) {
        moveImage(fromIndex, toIndex)
      }
    }
    
    setDraggedImageId(null)
    setDragOverImageId(null)
  }

  const handleEditComplete = (translatedImageUrl: string) => {
    if (editingImageId) {
      setImages(prev => {
        const updated = prev.map(img => 
          img.id === editingImageId 
            ? { ...img, url: translatedImageUrl }
            : img
        )
        // 직접 알림 제거 - useEffect가 처리함
        return updated
      })
    }
    
    setEditingImage(null)
    setEditingImageId(null)
  }

  const handleEditCancel = () => {
    setEditingImage(null)
    setEditingImageId(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
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
      handleFileUpload(files)
    }
  }

  const handleClick = () => {
    if (images.length < maxImages) {
      fileInputRef.current?.click()
    }
  }

  // 편집 모드인 경우
  if (editingImage) {
    const ImageTranslator = React.lazy(() => import('./ImageTranslator'))
    
    return (
      <div className="w-full">
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-2">이미지 번역 편집</h3>
          <p className="text-sm text-blue-700">선택된 이미지를 편집하고 있습니다. 완료 후 이미지 목록으로 돌아갑니다.</p>
        </div>
        
        <React.Suspense fallback={<div className="text-center py-8">에디터 로딩 중...</div>}>
          <ImageTranslator
            imageFile={editingImage}
            onTranslationComplete={handleEditComplete}
            onCancel={handleEditCancel}
          />
        </React.Suspense>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 업로드된 이미지들 */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">업로드된 이미지 ({images.length}개)</h4>
            <p className="text-xs text-gray-500">드래그하거나 화살표로 순서 변경</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className={`relative group border-2 rounded-lg transition-all ${
                  draggedImageId === image.id ? 'opacity-50' : 'opacity-100'
                } ${
                  dragOverImageId === image.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                draggable
                onDragStart={(e) => handleImageDragStart(e, image.id)}
                onDragOver={(e) => handleImageDragOver(e, image.id)}
                onDragLeave={handleImageDragLeave}
                onDrop={(e) => handleImageDrop(e, image.id)}
              >
                {/* 순서 번호 */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full z-10">
                  {index + 1}
                </div>
                
                {/* 드래그 핸들 */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded cursor-move z-10">
                  <GripVertical className="h-4 w-4" />
                </div>
                
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={`이미지 ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 이미지 액션 버튼들 */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="flex flex-col gap-2">
                    {/* 순서 변경 버튼들 */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(image.id)}
                        disabled={index === 0}
                        className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="위로 이동"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(image.id)}
                        disabled={index === images.length - 1}
                        className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="아래로 이동"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* 편집/삭제 버튼들 */}
                    <div className="flex gap-2">
                      {image.file && (
                        <button
                          type="button"
                          onClick={() => handleEditImage(image.id)}
                          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                          title="이미지 편집"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="이미지 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 새 이미지 업로드 영역 */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">이미지 업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-full">
                {images.length === 0 ? (
                  <ImageIcon className="h-8 w-8 text-gray-600" />
                ) : (
                  <Plus className="h-8 w-8 text-gray-600" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {images.length === 0 ? '이미지 업로드' : '이미지 추가'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  이미지를 드래그하거나 클릭하여 업로드 ({images.length}/{maxImages})
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, GIF 지원 • 여러 이미지 동시 업로드 가능
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 도움말 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 사용법</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 여러 이미지를 한 번에 업로드할 수 있습니다</li>
          <li>• 이미지를 드래그하여 순서를 변경할 수 있습니다</li>
          <li>• 이미지 위에 마우스를 올리면 편집/삭제/순서변경 버튼이 나타납니다</li>
          <li>• 편집 버튼을 클릭하면 한국어 텍스트를 번역할 수 있습니다</li>
          <li>• 최대 {maxImages}개의 이미지까지 업로드 가능합니다</li>
        </ul>
      </div>
    </div>
  )
} 