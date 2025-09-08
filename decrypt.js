// decrypt.js
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

/**
 * Decrypts an AES-256-CTR encrypted file
 * @param {string} inputPath - Path to encrypted file
 * @param {string} outputPath - Path where decrypted file will be saved
 * @param {string} keyHex - Encryption key in hex
 * @param {string} ivHex - Initialization vector in hex
 */
function decryptFile(inputPath, outputPath, keyHex, ivHex) {
  const algorithm = 'aes-256-ctr';
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  input.pipe(decipher).pipe(output);

  output.on('finish', () => {
    console.log(`✅ File decrypted and saved to: ${outputPath}`);
  });

  output.on('error', (err) => {
    console.error('❌ Decryption failed:', err);
  });
}

// ---- CLI usage ----
// node decrypt.js <encryptedFile> <keyHex> <ivHex> [outputFile]
if (require.main === module) {
  const [,, encryptedFile, keyHex, ivHex, outputFile] = process.argv;

  if (!encryptedFile || !keyHex || !ivHex) {
    console.error('Usage: node decrypt.js <encryptedFile> <keyHex> <ivHex> [outputFile]');
    process.exit(1);
  }

  const outFile = outputFile || encryptedFile.replace(/\.enc$/, '');
  decryptFile(encryptedFile, outFile, keyHex, ivHex);
}

module.exports = decryptFile;
