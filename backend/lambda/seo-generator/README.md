# EV Car Wale - AWS Lambda SEO Generator (Node.js 22)

Production-ready AWS Lambda function that automates search engine optimization (SEO) for **EV Car Wale**.

---

## ⚡ Overview & Features

1. **Automatic HTML Project Scanning**:
   - Recursively discovers `index.html`, all `insights/*.html` pages, policy pages (`privacy-policy.html`, `corporate-policies.html`, `terms-and-conditions.html`), tools, and calculators.
   - Reads `data/cars.json` or `backend/src/routes/Cars.json` to generate dynamic car routes (`/cars/{id}`).

2. **Automated SEO Injections (Zero Design/CSS Impact)**:
   - **Canonical URLs**: `<link rel="canonical" href="..." />`
   - **OpenGraph Meta Tags**: `og:site_name`, `og:title`, `og:description`, `og:url`, `og:type`, `og:image`.
   - **Twitter Card Tags**: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
   - **JSON-LD Schema**: Valid `@context: "https://schema.org"` structured data (`WebSite`, `Organization`, `Article`, `WebApplication`, `FAQPage`, `WebPage`).

3. **Duplication Guard & Non-Destructive Guarantee**:
   - Pre-checks existing tags before insertion so no meta tag is duplicated.
   - Preserves 100% of existing HTML structure, CSS styles, JavaScript logic, and design aesthetics.

4. **Sitemap & Robots Generator**:
   - Generates production-ready `sitemap.xml` with automatic file modification timestamps (`lastmod`).
   - Generates standard `robots.txt` with crawler directives and sitemap URL pointer.

5. **Multi-Environment Execution**:
   - Runs directly in **AWS Lambda (Node.js 22.x)**.
   - Runs locally or in CI/CD pipelines via CLI (`npm start` or `node index.js`).
   - Supports direct S3 sync via `@aws-sdk/client-s3`.

---

## 📁 Directory Structure

```
backend/lambda/seo-generator/
├── index.js          # AWS Lambda Handler & Core SEO Generator Engine
├── package.json      # Node.js 22 package manifest & dependencies
└── README.md         # Deployment & Operations Guide
```

---

## 🚀 Local Usage & Testing

### 1. Test Locally
Run the Lambda handler locally against the EV Car Wale workspace:

```bash
cd backend/lambda/seo-generator
npm start
```

Or run via npm test script:
```bash
npm test
```

### 2. Environment Variables (Optional)
- `SITE_URL`: Domain URL (Default: `https://www.evcarwale.com`)
- `S3_BUCKET`: Target AWS S3 Bucket Name for uploading `sitemap.xml` and `robots.txt`
- `AWS_REGION`: AWS Region (Default: `ap-south-1`)

---

## 🛠️ AWS Lambda Deployment Instructions

### Prerequisites
- AWS Account & AWS CLI configured (`aws configure`)
- Node.js 22.x installed locally

### Step 1: Package the Lambda Function
```bash
cd backend/lambda/seo-generator
npm install --production
zip -r seo-generator-lambda.zip index.js package.json node_modules
```

### Step 2: Create or Update AWS Lambda Function via AWS CLI
```bash
aws lambda create-function \
  --function-name EVCarWale-SEO-Generator \
  --runtime nodejs22.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/service-role/LambdaS3FullAccess \
  --handler index.handler \
  --zip-file fileb://seo-generator-lambda.zip \
  --timeout 30 \
  --memory-size 256 \
  --region ap-south-1 \
  --environment "Variables={SITE_URL=https://www.evcarwale.com,S3_BUCKET=ev-car-wale}"
```

To update existing Lambda code:
```bash
aws lambda update-function-code \
  --function-name EVCarWale-SEO-Generator \
  --zip-file fileb://seo-generator-lambda.zip \
  --region ap-south-1
```

---

## ⏰ Automated Recurring Execution (Amazon EventBridge)

To automatically run this Lambda every day at 12:00 AM UTC to refresh sitemap timestamps and SEO tags:

```bash
aws events put-rule \
  --name EVCarWale-SEO-DailyCron \
  --schedule-expression "cron(0 0 * * ? *)" \
  --region ap-south-1

aws lambda add-permission \
  --function-name EVCarWale-SEO-Generator \
  --statement-id DailyCronPermission \
  --action 'lambda:InvokeFunction' \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:ap-south-1:YOUR_ACCOUNT_ID:rule/EVCarWale-SEO-DailyCron

aws events put-targets \
  --rule EVCarWale-SEO-DailyCron \
  --targets "Id"="1","Arn"="arn:aws:lambda:ap-south-1:YOUR_ACCOUNT_ID:function:EVCarWale-SEO-Generator"
```

---

## 📊 Sample Lambda Output Response

```json
{
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "body": {
    "message": "SEO Generator executed successfully.",
    "timestamp": "2026-08-07T15:47:11.000Z",
    "siteUrl": "https://www.evcarwale.com",
    "scannedPagesCount": 30,
    "dynamicVehiclesCount": 85,
    "sitemapUrl": "https://www.evcarwale.com/sitemap.xml",
    "robotsUrl": "https://www.evcarwale.com/robots.txt"
  }
}
```
