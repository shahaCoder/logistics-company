import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Validate Cloudinary credentials
function validateCloudinaryConfig(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missing: string[] = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    throw new Error(
      `Cloudinary configuration is missing. Please set the following environment variables: ${missing.join(', ')}`
    );
  }
}

// Initialize Cloudinary only if credentials are available
let cloudinaryInitialized = false;

function initializeCloudinary(): void {
  if (cloudinaryInitialized) return;
  
  validateCloudinaryConfig();
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
  
  cloudinaryInitialized = true;
}

/**
 * Uploads a file buffer to Cloudinary
 * @param buffer - File buffer to upload
 * @param options - Upload options (folder, etc.)
 * @returns Object with url and publicId
 */
export async function uploadDriverFile(
  buffer: Buffer,
  options?: { folder?: string; resourceType?: 'image' | 'raw' }
): Promise<{ url: string; publicId: string }> {
  try {
    initializeCloudinary();
  } catch (error) {
    throw new Error(
      `Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.`
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options?.folder || 'driver_applications',
        resource_type: options?.resourceType || 'auto',
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // Convert buffer to stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

/**
 * Deletes a file from Cloudinary by public ID
 * @param publicId - Cloudinary public ID
 */
export async function deleteDriverFile(publicId: string): Promise<void> {
  try {
    initializeCloudinary();
  } catch (error) {
    throw new Error(
      `Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.`
    );
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Failed to delete file from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Uploads a file to a specific application folder
 * @param buffer - File buffer
 * @param applicationId - Application ID for folder organization
 * @param fileName - Optional file name prefix
 * @param resourceType - Resource type (image or raw)
 */
export async function uploadToApplicationFolder(
  buffer: Buffer,
  applicationId: string,
  fileName?: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<{ url: string; publicId: string }> {
  try {
    initializeCloudinary();
  } catch (error) {
    throw new Error(
      `Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.`
    );
  }

  const folder = `driver_applications/${applicationId}`;
  const publicId = fileName ? `${folder}/${fileName}` : undefined;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: !publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

