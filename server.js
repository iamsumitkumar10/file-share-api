require('dotenv').config(); // Load .env first

const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const AWS = require('aws-sdk');
const morgan = require('morgan');

// Express app setup
const app = express();
app.use(express.json());
app.use(morgan('combined'));

// ✅ Token auth from .env (fallback to default if missing)
const ACCESS_TOKEN = process.env.AUTH_TOKEN || "mysecrettoken";

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token || token !== `Bearer ${ACCESS_TOKEN}`) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// ✅ AWS S3 setup from .env
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  region: process.env.AWS_REGION || "us-east-1",
  s3ForcePathStyle: true, // needed for MinIO / LocalStack
});

const BUCKET_NAME = process.env.AWS_BUCKET || "secure-bucket";

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Encrypt file before upload
function encryptFile(filePath) {
  const algorithm = 'aes-256-ctr';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const input = fs.createReadStream(filePath);
  const outputPath = filePath + '.enc';
  const output = fs.createWriteStream(outputPath);

  input.pipe(cipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on('finish', () =>
      resolve({ path: outputPath, key: key.toString('hex'), iv: iv.toString('hex') })
    );
    output.on('error', reject);
  });
}

// 📥 Upload route
app.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { path, key, iv } = await encryptFile(req.file.path);
    const fileContent = fs.readFileSync(path);

    // Upload encrypted file to S3
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: req.file.originalname + '.enc',
      Body: fileContent,
    }).promise();

    // Clean up local files
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(path);

    res.json({
      message: 'File uploaded securely',
      key,
      iv,
      filename: req.file.originalname + '.enc',
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// 📤 Download route
app.get('/download/:filename', authMiddleware, async (req, res) => {
  try {
    const file = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key: req.params.filename,
    }).promise();

    res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
    res.send(file.Body);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
