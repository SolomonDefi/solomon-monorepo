export interface MediaRequirements {
  width?: number
  height?: number
  ext?: string[]
  size?: number
}

export interface ValidatedFile {
  file: File
  src?: string
}

type ValidateMediaCallback = (file: ValidatedFile, errors: string[] | null) => void

export function validateMedia(
  requirements: MediaRequirements,
  file: File,
  callback: ValidateMediaCallback,
): string | null {
  const errors: string[] = []
  const URL = window.URL || window.webkitURL
  let img: HTMLImageElement | null = null
  let video = null
  const result: ValidatedFile = { file }
  result.src = URL.createObjectURL(file)

  const { ext, size } = requirements
  const reqSize = size ?? 0
  if (file.size > reqSize) {
    errors.push('FILE_SIZE_BIG')
  }
  const fileExt = file.name.split('.').pop()
  if (ext && (!fileExt || !ext.includes(fileExt))) {
    errors.push('FILE_TYPE')
  }
  if (errors.length) {
    callback(result, errors)
    return null
  }

  try {
    const fileType = file.type || ''
    if (fileType.includes('image')) {
      img = new Image()
      img.src = result.src
    } else if (fileType.includes('vide')) {
      video = document.createElement('video')
      video.src = result.src
    }
  } catch (error) {
    errors.push('FILE_TYPE')
  }
  if (video) {
    video.addEventListener('loadeddata', (_e) => {
      callback(result, null)
    })
    return video.src
  } else if (img) {
    img.onload = () => {
      const { width, height } = requirements
      if (width && height) {
        const minRatio = (width / height) * 0.95
        const maxRatio = (width / height) * 1.05
        const reqWidth = img?.width ?? 0
        const reqHeight = img?.height ?? 1
        const imageRatio = reqWidth / reqHeight
        if (imageRatio < minRatio || imageRatio > maxRatio) {
          errors.push('IMAGE_ASPECT_RATIO')
        }
        if (reqWidth < width || reqHeight < height) {
          errors.push('IMAGE_DIMENSIONS')
        }
      }
      if (errors.length) {
        callback(result, errors)
      } else {
        callback(result, null)
      }
    }
    return img.src
  } else {
    callback(result, errors)
    return null
  }
}
