const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

exports.handler = async (event, context) => {
    // Add CORS headers for local testing via npm start
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    // Handle Preflight Request
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    // Only allow POST requests for security
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { fileName, contentType, fileExt, folder } = body;

        if (!fileName) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "fileName is required" })
            };
        }

        // Must be set in Netlify's Environment Variables dashboard
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        const bucketName = process.env.R2_BUCKET_NAME;
        const publicUrlBase = process.env.R2_PUBLIC_URL_BASE; // e.g: https://pub-xxxxxx.r2.dev

        if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrlBase) {
            console.error("Missing R2 Config:", { accountId, key: !!accessKeyId, secret: !!secretAccessKey, bucketName, publicUrlBase });
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Server storage configuration is missing" })
            };
        }

        // Initialize AWS S3 client pointed to Cloudflare R2
        const S3 = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });

        // Generate safe file name
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9);
        const extension = fileExt || fileName.split('.').pop();
        const safeFileName = `${timestamp}-${randomStr}.${extension}`;

        // Construct object key with folder
        const folderPath = folder ? `${folder}/` : 'general/';
        const objectKey = `${folderPath}${safeFileName}`;

        // Prepare S3 Command
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
            ContentType: contentType || 'application/octet-stream',
        });

        // Generate a pre-signed URL valid for 5 minutes
        const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });

        // Construct the public matching URL
        const r2PublicUrl = `${publicUrlBase.replace(/\/$/, '')}/${objectKey}`;

        return {
            statusCode: 200,
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uploadUrl,       // Link React will use to PUT the file
                r2PublicUrl,     // Link saved in DB for students to access
                objectKey,       // The internal path
            }),
        };
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to generate upload URL", details: error.message }),
        };
    }
};
