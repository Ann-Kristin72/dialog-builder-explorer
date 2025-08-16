import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

class AzureStorageService {
  constructor() {
    this.credential = new DefaultAzureCredential();
    this.keyVaultUrl = process.env.AZURE_KEY_VAULT_URL;
    this.secretClient = null;
    this.blobServiceClient = null;
    this.coursesContainer = null;
    this.brandingContainer = null;
  }

  // Initialize Key Vault client
  async initializeKeyVault() {
    if (!this.keyVaultUrl) {
      throw new Error('AZURE_KEY_VAULT_URL environment variable is required');
    }

    try {
      this.secretClient = new SecretClient(this.keyVaultUrl, this.credential);
      console.log('✅ Key Vault client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Key Vault:', error);
      throw error;
    }
  }

  // Get storage connection string from Key Vault
  async getStorageConnectionString() {
    try {
      const secret = await this.secretClient.getSecret('StorageConnectionString');
      return secret.value;
    } catch (error) {
      console.error('❌ Failed to get storage connection string:', error);
      throw new Error('Could not retrieve storage connection string from Key Vault');
    }
  }

  // Initialize Azure Storage clients
  async initializeStorage() {
    try {
      const connectionString = await this.getStorageConnectionString();
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      
      // Get container references
      this.coursesContainer = this.blobServiceClient.getContainerClient('courses');
      this.brandingContainer = this.blobServiceClient.getContainerClient('branding');
      
      console.log('✅ Azure Storage clients initialized');
    } catch (error) {
      console.error('❌ Failed to initialize storage:', error);
      throw error;
    }
  }

  // Upload course file to blob storage
  async uploadCourseFile(fileName, fileBuffer, contentType = 'text/markdown') {
    try {
      if (!this.coursesContainer) {
        await this.initializeStorage();
      }

      const blobName = `courses/${fileName}`;
      const blockBlobClient = this.coursesContainer.getBlockBlobClient(blobName);
      
      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
        metadata: {
          uploadedAt: new Date().toISOString(),
          fileType: 'course',
        }
      });

      console.log(`✅ Course file uploaded: ${blobName}`);
      return {
        url: blockBlobClient.url,
        blobName: blobName,
        size: fileBuffer.length
      };
    } catch (error) {
      console.error('❌ Failed to upload course file:', error);
      throw error;
    }
  }

  // Upload branding asset (CSS, images, etc.)
  async uploadBrandingAsset(fileName, fileBuffer, contentType) {
    try {
      if (!this.brandingContainer) {
        await this.initializeStorage();
      }

      const blobName = `branding/${fileName}`;
      const blockBlobClient = this.brandingContainer.getBlockBlobClient(blobName);
      
      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
        metadata: {
          uploadedAt: new Date().toISOString(),
          fileType: 'branding',
        }
      });

      console.log(`✅ Branding asset uploaded: ${blobName}`);
      return {
        url: blockBlobClient.url,
        blobName: blobName,
        size: fileBuffer.length
      };
    } catch (error) {
      console.error('❌ Failed to upload branding asset:', error);
      throw error;
    }
  }

  // Get course file from blob storage
  async getCourseFile(fileName) {
    try {
      if (!this.coursesContainer) {
        await this.initializeStorage();
      }

      const blobName = `courses/${fileName}`;
      const blockBlobClient = this.coursesContainer.getBlockBlobClient(blobName);
      
      const downloadResponse = await blockBlobClient.download();
      const content = await this.streamToBuffer(downloadResponse.readableStreamBody);
      
      return {
        content: content.toString(),
        contentType: downloadResponse.contentType,
        size: content.length,
        lastModified: downloadResponse.lastModified
      };
    } catch (error) {
      console.error('❌ Failed to get course file:', error);
      throw error;
    }
  }

  // Get branding asset from blob storage
  async getBrandingAsset(fileName) {
    try {
      if (!this.brandingContainer) {
        await this.initializeStorage();
      }

      const blobName = `branding/${fileName}`;
      const blockBlobClient = this.brandingContainer.getBlockBlobClient(blobName);
      
      const downloadResponse = await blockBlobClient.download();
      const content = await this.streamToBuffer(downloadResponse.readableStreamBody);
      
      return {
        content: content,
        contentType: downloadResponse.contentType,
        size: content.length,
        lastModified: downloadResponse.lastModified
      };
    } catch (error) {
      console.error('❌ Failed to get branding asset:', error);
      throw error;
    }
  }

  // List all course files
  async listCourseFiles() {
    try {
      if (!this.coursesContainer) {
        await this.initializeStorage();
      }

      const files = [];
      for await (const blob of this.coursesContainer.listBlobsFlat()) {
        if (blob.name.startsWith('courses/')) {
          files.push({
            name: blob.name.replace('courses/', ''),
            size: blob.properties.contentLength,
            lastModified: blob.properties.lastModified,
            url: `${this.coursesContainer.url}/${blob.name}`
          });
        }
      }

      return files;
    } catch (error) {
      console.error('❌ Failed to list course files:', error);
      throw error;
    }
  }

  // List all branding assets
  async listBrandingAssets() {
    try {
      if (!this.brandingContainer) {
        await this.initializeStorage();
      }

      const assets = [];
      for await (const blob of this.brandingContainer.listBlobsFlat()) {
        if (blob.name.startsWith('branding/')) {
          assets.push({
            name: blob.name.replace('branding/', ''),
            size: blob.properties.contentLength,
            lastModified: blob.properties.lastModified,
            url: `${this.brandingContainer.url}/${blob.name}`
          });
        }
      }

      return assets;
    } catch (error) {
      console.error('❌ Failed to list branding assets:', error);
      throw error;
    }
  }

  // Delete course file
  async deleteCourseFile(fileName) {
    try {
      if (!this.coursesContainer) {
        await this.initializeStorage();
      }

      const blobName = `courses/${fileName}`;
      const blockBlobClient = this.coursesContainer.getBlockBlobClient(blobName);
      
      await blockBlobClient.delete();
      console.log(`✅ Course file deleted: ${blobName}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete course file:', error);
      throw error;
    }
  }

  // Delete branding asset
  async deleteBrandingAsset(fileName) {
    try {
      if (!this.brandingContainer) {
        await this.initializeStorage();
      }

      const blobName = `branding/${fileName}`;
      const blockBlobClient = this.brandingContainer.getBlockBlobClient(blobName);
      
      await blockBlobClient.delete();
      console.log(`✅ Branding asset deleted: ${blobName}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete branding asset:', error);
      throw error;
    }
  }

  // Helper function to convert stream to buffer
  async streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }

  // Initialize all services
  async initialize() {
    try {
      await this.initializeKeyVault();
      await this.initializeStorage();
      console.log('✅ Azure Storage Service fully initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Azure Storage Service:', error);
      throw error;
    }
  }
}

export const azureStorageService = new AzureStorageService();
export default azureStorageService;
