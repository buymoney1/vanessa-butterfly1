import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

// کش کردن connection
let cachedClient: MongoClient | null = null;
let cachedBucket: GridFSBucket | null = null;

// دریافت connection به MongoDB
async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const mongoClient = new MongoClient(process.env.DATABASE_URL!);
  await mongoClient.connect();
  cachedClient = mongoClient;
  return mongoClient;
}

// دریافت GridFS bucket
export async function getGridFSBucket(): Promise<GridFSBucket> {
  if (cachedBucket) {
    return cachedBucket;
  }

  const client = await getMongoClient();
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: 'products' });
  
  cachedBucket = bucket;
  return bucket;
}

// ذخیره فایل در GridFS
export async function saveFileToGridFS(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ایجاد نام فایل منحصربه‌فرد
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const originalName = file.name.replace(/\s+/g, '-');
    const filename = `${timestamp}-${random}-${originalName}`;
    
    const bucket = await getGridFSBucket();
    
    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date(),
          size: file.size
        }
      });
      
      uploadStream.write(buffer);
      uploadStream.end();
      
      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString());
      });
      
      uploadStream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error saving file to GridFS:', error);
    throw error;
  }
}

// دریافت اطلاعات فایل
export async function getFileInfo(fileId: string) {
  try {
    const bucket = await getGridFSBucket();
    const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
    return files[0] || null;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}

// حذف فایل از GridFS
export async function deleteFileFromGridFS(fileId: string): Promise<boolean> {
  try {
    const bucket = await getGridFSBucket();
    await bucket.delete(new ObjectId(fileId));
    return true;
  } catch (error) {
    console.error('Error deleting file from GridFS:', error);
    return false;
  }
}

// دریافت stream فایل برای دانلود
export async function getFileStream(fileId: string) {
  try {
    const bucket = await getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    return downloadStream;
  } catch (error) {
    console.error('Error getting file stream:', error);
    return null;
  }
}

// بررسی وجود فایل
export async function fileExists(fileId: string): Promise<boolean> {
  try {
    const info = await getFileInfo(fileId);
    return info !== null;
  } catch (error) {
    return false;
  }
}