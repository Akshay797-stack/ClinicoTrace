# ClinicoTrace

**Zero-Hallucination Clinical Safety & Patient Communication Platform for High-Volume OPDs.**

ClinicoTrace bridges the gap between messy clinical reality and structured, safe clinical decisions. Designed for high-throughput healthcare settings (like Indian hospital OPDs), it assists clinicians by capturing input, structuring data, and enforcing deterministic safety rules—without ever making the final clinical decision.

**CORE PRINCIPLE:**  
*AI extracts. Rules verify. Doctor decides. Patient understands.*

---

## 🏗️ Architecture Overview

ClinicoTrace leverages a modern, serverless AWS architecture separating non-deterministic AI tasks from deterministic clinical safety protocols.

```text
                         ┌─────────────────────┐
                         │   ClinicoTrace UI   │
                         │    Next.js Web App  │
                         └──────────┬──────────┘
                                    │
                           Authentication
                                    │
                              Amazon Cognito
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    API / Backend    │
                         │   Lambda / Next.js  │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          Voice / Image        AI Extraction       Authorization
                 │                  │                  │
        Amazon Transcribe      Bedrock /          Verified
        / image processing     AgentCore           Permissions
                                    │               + Cedar
                                    ▼
                         Structured Clinical Data
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Deterministic       │
                         │ Safety Engine       │
                         │ Python Rules        │
                         └──────────┬──────────┘
                                    │
                         DDI / Dose / Contra-
                         indication checks
                                    │
                                    ▼
                            Doctor Confirmation
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
          Patient Instructions                  Audit / Storage
                  │                                   │
          Amazon Translate                        S3 / DB
          + optional TTS
```

---

## ☁️ AWS Integration & Infrastructure Strategy

We have architected ClinicoTrace around managed AWS services to ensure security, compliance, and rapid scalability. Below is the rationale and integration strategy for our AWS resources.

### 1. Amazon Bedrock & AgentCore — The Orchestration & Intelligence Layer
*   **Amazon Bedrock**: Provides managed access to foundation models via the `bedrock-runtime` endpoint. It translates messy, unstructured clinical dictation into structured JSON (e.g., patient conditions, medications, dosages). *Crucially, Bedrock is strictly an extraction tool—it never makes clinical safety judgments.*
*   **Amazon Bedrock AgentCore & Strands Framework**: We utilize Strands Agents for framework logic and deploy via AgentCore for a secure, serverless runtime. AgentCore orchestrates the workflow (e.g., Doctor Input → Extraction Tool → Safety Tool → Confirmation), providing session isolation and agent observability.

### 2. AWS Verified Permissions (Cedar) — Zero-Trust Authorization
ClinicoTrace handles highly sensitive PHI (Protected Health Information). Instead of fragile, application-level `if (user.role === 'doctor')` checks, we externalize authorization to **AWS Verified Permissions**.
*   Using the **Cedar** policy language, we evaluate fine-grained permissions.
*   **Example**: A Doctor can `AUTHORIZE` a prescription, a Pharmacist can `DISPENSE`, and Billing can only `VIEW_DIAGNOSIS`.

### 3. Amazon Transcribe — Clinical Voice Input
To reduce physician burnout in high-volume OPDs, we use **Amazon Transcribe** for speech-to-text.
*   Transcribe handles multilingual dictation (including Hindi, Tamil, and Telugu).
*   The raw transcript is then routed to the extraction layer. *(Note: We use general Transcribe for broad language support, handling clinical structuring downstream.)*

### 4. Amazon Translate — Patient Accessibility
After a doctor authorizes a prescription, compliance drops if the patient cannot understand the instructions.
*   We use **Amazon Translate** to convert patient-friendly instruction templates into the patient's native language (Tamil, Hindi, Telugu).
*   *Safety guardrail*: We translate structured templates, never raw clinical text, preventing LLM mistranslation of critical medical details.

### 5. Serverless Compute & Storage (Lambda, S3, RDS)
*   **AWS Lambda**: Powers our backend API routes. This serverless approach eliminates EC2 management and scales infinitely with OPD traffic.
*   **Amazon S3**: Acts as the secure object store for raw clinical artifacts (audio recordings, scanned prescriptions, patient uploads).
*   **Amazon RDS (PostgreSQL)**: The source of truth for relational application data (Patients, Encounters, Safety Findings, Authorizations), queried via Prisma ORM.

### 6. Security & Observability (IAM & CloudWatch)
*   **AWS IAM**: Strictly controls resource-level access (e.g., Lambda execution roles restricted to specific S3 buckets or Bedrock model IDs). *IAM secures the infrastructure; Cedar secures the application.*
*   **Amazon CloudWatch**: Provides healthcare-grade observability. We monitor extraction confidence thresholds, safety evaluation latencies, and authorization audit trails.

---

## 🛠️ Local Development & Hackathon Demo Mode

For the hackathon, the application runs in a deterministic **Demo Mode** to ensure stable, fast presentations without relying on live AWS endpoints. We have implemented "Production Stubs" (`src/providers/production/`) ready to be wired up to AWS post-hackathon.

### Prerequisites
- Node.js 18+
- Docker (for local PostgreSQL database)

### Setup
```bash
npm install
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```bash
NEXT_PUBLIC_MODE=demo  # Uses deterministic mock providers

# --- Post-Hackathon AWS Integration ---
# NEXT_PUBLIC_MODE=production
# AWS_REGION=ap-south-1
# BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
# AVP_POLICY_STORE_ID=your_cedar_store_id
```

---

## 🚀 Deployment

The UI and Next.js API routes are optimized for deployment via **AWS Amplify**. 

1. Connect your repository to AWS Amplify.
2. The `amplify.yml` build specification is already configured in the repository root.
3. Ensure the `NEXT_PUBLIC_MODE` environment variable is set appropriately in the Amplify console.

*Built for the Bharat Build Hackathon, Bangalore.*
