# Secure File Sharing API

A simple **secure file upload and sharing API** built with **Node.js, Express, AWS S3, and file encryption**.  
This project demonstrates how to securely upload files, encrypt them before storage, log access, and allow downloads using **token-based authentication**.

---

## Features
- 🔒 AES-256 file encryption before uploading to S3  
- 📂 File storage in **AWS S3** (or S3-compatible services like MinIO/LocalStack)  
- 🔑 Simple **token-based authentication**  
- 📝 Request logging with `morgan`  
- 📥 Upload and 📤 download endpoints  

---

## Installation

1. Clone or extract the project:
   ```bash
   unzip secure-file-sharing.zip
   cd secure-file-sharing
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set environment variables (or edit directly in `server.js` for testing):
   ```bash
   export AWS_ACCESS_KEY_ID=yourkey
   export AWS_SECRET_ACCESS_KEY=yoursecret
   export AWS_REGION=us-east-1
   export AWS_BUCKET=secure-bucket
   ```

---

## Running the Server

Start the API:
```bash
npm start
```

Server will run on **http://localhost:3000**

---

## API Usage

### 🔐 Authentication
All requests must include a token:
```
Authorization: Bearer mysecrettoken
```
(Default token is set inside `server.js`. Change it for production.)

---

### 📥 Upload File
```bash
curl -X POST http://localhost:3000/upload \
  -H "Authorization: Bearer mysecrettoken" \
  -F "file=@test.txt"
```

**Response Example:**
```json
{
  "message": "File uploaded securely",
  "key": "hex_key_here",
  "iv": "hex_iv_here",
  "filename": "test.txt.enc"
}
```

---

### 📤 Download File
```bash
curl -X GET http://localhost:3000/download/test.txt.enc \
  -H "Authorization: Bearer mysecrettoken" -o downloaded.enc
```

The file will still be encrypted. You can decrypt it manually using the `key` and `iv` provided in the upload response.

---

## Project Structure
```
secure-file-sharing/
│── package.json     # Dependencies and scripts
│── server.js        # Express API server
│── README.md        # Documentation
```

---

## Notes
- This project is simplified for demonstration purposes.  
- In production:
  - Use a database for storing keys/metadata instead of returning them directly.  
  - Use environment variables for tokens and secrets.  
  - Consider integrating a user authentication system (JWT, OAuth).  
  - Add a decryption endpoint if needed.  

---

 
npm install dotenv