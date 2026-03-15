-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ANALYST', 'COLLECTION', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'PAID', 'DEFAULTED', 'RESTRUCTURED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "InterestType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE_MONTHLY', 'PERCENTAGE_ANNUAL');

-- CreateEnum
CREATE TYPE "AmortizationType" AS ENUM ('AMERICAN', 'FRENCH', 'GERMAN', 'SIMPLE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'PARTIAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "AllocationType" AS ENUM ('PRINCIPAL', 'INTEREST', 'PENALTY', 'FEE');

-- CreateEnum
CREATE TYPE "CollectionActionType" AS ENUM ('CALL', 'EMAIL', 'SMS', 'VISIT', 'LEGAL_NOTICE', 'PROMISE_FOLLOWUP', 'RESTRUCTURE_PROPOSAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CollectionActionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CollectionResult" AS ENUM ('NO_ANSWER', 'PHONE_OFF', 'WRONG_NUMBER', 'PROMISE_MADE', 'PAYMENT_MADE', 'REFUSED_TO_PAY', 'AGREED_TO_RESTRUCTURE', 'REQUESTED_EXTENSION', 'HOSTILE', 'OTHER');

-- CreateEnum
CREATE TYPE "PromiseStatus" AS ENUM ('PENDING', 'KEPT', 'BROKEN', 'RENEGOTIATED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('CLIENT', 'LOAN', 'APPLICATION', 'PAYMENT');

-- CreateEnum
CREATE TYPE "ParameterCategory" AS ENUM ('FINANCIAL', 'RISK', 'COLLECTION', 'BUSINESS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ParameterType" AS ENUM ('DECIMAL', 'INTEGER', 'BOOLEAN', 'STRING', 'JSON');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'UPDATE_STATUS', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'DISBURSE', 'PAYMENT_REGISTERED', 'CREDIT_LIMIT_CHANGE', 'NOTE_ADDED', 'PARAMETER_CHANGED', 'PROMISE_CREATED', 'PROMISE_BROKEN', 'COLLECTION_ACTION', 'RESTRUCTURE');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE', 'PERMISSION_CHANGE', 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_ACTIVITY', 'IP_BLOCKED', 'MASS_EXPORT', 'MASS_DELETE', 'UNAUTHORIZED_ACCESS', 'SESSION_EXPIRED');

-- CreateEnum
CREATE TYPE "SecuritySeverity" AS ENUM ('INFO', 'WARNING', 'ALERT', 'CRITICAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "creditLimit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "internalScore" INTEGER DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "individual_profiles" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "occupation" TEXT,
    "income" DECIMAL(12,2),
    "reference1Name" TEXT,
    "reference1Phone" TEXT,
    "reference2Name" TEXT,
    "reference2Phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "individual_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "legalRepName" TEXT NOT NULL,
    "legalRepTaxId" TEXT NOT NULL,
    "industry" TEXT,
    "annualRevenue" DECIMAL(15,2),
    "employeeCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_applications" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "requestedAmount" DECIMAL(15,2) NOT NULL,
    "purpose" TEXT,
    "termMonths" INTEGER NOT NULL,
    "proposedRate" DECIMAL(5,4) NOT NULL,
    "paymentFrequency" "PaymentFrequency" NOT NULL DEFAULT 'MONTHLY',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvalNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" TEXT NOT NULL,
    "loanNumber" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "principalAmount" DECIMAL(15,2) NOT NULL,
    "outstandingPrincipal" DECIMAL(15,2) NOT NULL,
    "amortizationType" "AmortizationType" NOT NULL DEFAULT 'AMERICAN',
    "interestType" "InterestType" NOT NULL,
    "interestRate" DECIMAL(5,4) NOT NULL,
    "fixedInterestAmount" DECIMAL(15,2),
    "termMonths" INTEGER NOT NULL,
    "paymentFrequency" "PaymentFrequency" NOT NULL,
    "allowSaturdayPayments" BOOLEAN NOT NULL DEFAULT true,
    "allowSundayPayments" BOOLEAN NOT NULL DEFAULT true,
    "disbursementDate" TIMESTAMP(3) NOT NULL,
    "firstDueDate" TIMESTAMP(3) NOT NULL,
    "finalDueDate" TIMESTAMP(3) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalInterest" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalPaid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalPenalty" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "hasGuarantor" BOOLEAN NOT NULL DEFAULT false,
    "guarantorName" TEXT,
    "guarantorTaxId" TEXT,
    "guarantorPhone" TEXT,
    "guarantorAddress" TEXT,
    "collateralType" TEXT,
    "collateralValue" DECIMAL(15,2),
    "collateralNotes" TEXT,
    "notes" TEXT,
    "clientInstructions" TEXT,
    "sendEmailOnCreate" BOOLEAN NOT NULL DEFAULT true,
    "contractGenerated" BOOLEAN NOT NULL DEFAULT false,
    "contractUrl" TEXT,
    "contractGeneratedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "principalAmount" DECIMAL(15,2) NOT NULL,
    "interestAmount" DECIMAL(15,2) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "paidPrincipal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paidInterest" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paidPenalty" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "pendingAmount" DECIMAL(15,2) NOT NULL,
    "penaltyAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "daysOverdue" INTEGER NOT NULL DEFAULT 0,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "type" "AllocationType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_limit_changes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "previousLimit" DECIMAL(15,2) NOT NULL,
    "newLimit" DECIMAL(15,2) NOT NULL,
    "reason" TEXT,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousRate" DECIMAL(5,4),
    "newRate" DECIMAL(5,4),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_limit_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_actions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "loanId" TEXT,
    "actionType" "CollectionActionType" NOT NULL,
    "status" "CollectionActionStatus" NOT NULL DEFAULT 'PENDING',
    "result" "CollectionResult",
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "assignedTo" TEXT,
    "completedBy" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followUpDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_promises" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "loanId" TEXT,
    "promiseDate" TIMESTAMP(3) NOT NULL,
    "promisedAmount" DECIMAL(15,2) NOT NULL,
    "status" "PromiseStatus" NOT NULL DEFAULT 'PENDING',
    "actualPaidDate" TIMESTAMP(3),
    "actualPaidAmount" DECIMAL(15,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_promises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_notes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_parameters" (
    "id" TEXT NOT NULL,
    "category" "ParameterCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "ParameterType" NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEditable" BOOLEAN NOT NULL DEFAULT true,
    "minValue" TEXT,
    "maxValue" TEXT,
    "lastModifiedBy" TEXT,
    "lastModifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parameter_change_logs" (
    "id" TEXT NOT NULL,
    "parameterKey" TEXT NOT NULL,
    "previousValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parameter_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_logs" (
    "id" TEXT NOT NULL,
    "eventType" "SecurityEventType" NOT NULL,
    "severity" "SecuritySeverity" NOT NULL DEFAULT 'INFO',
    "userId" TEXT,
    "email" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "individual_profiles_clientId_key" ON "individual_profiles"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "individual_profiles_taxId_key" ON "individual_profiles"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_clientId_key" ON "business_profiles"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_taxId_key" ON "business_profiles"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "loans_loanNumber_key" ON "loans"("loanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "installments_loanId_installmentNumber_key" ON "installments"("loanId", "installmentNumber");

-- CreateIndex
CREATE INDEX "collection_actions_clientId_idx" ON "collection_actions"("clientId");

-- CreateIndex
CREATE INDEX "collection_actions_assignedTo_idx" ON "collection_actions"("assignedTo");

-- CreateIndex
CREATE INDEX "collection_actions_status_idx" ON "collection_actions"("status");

-- CreateIndex
CREATE INDEX "collection_actions_scheduledDate_idx" ON "collection_actions"("scheduledDate");

-- CreateIndex
CREATE INDEX "client_notes_clientId_idx" ON "client_notes"("clientId");

-- CreateIndex
CREATE INDEX "client_notes_userId_idx" ON "client_notes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "system_parameters_key_key" ON "system_parameters"("key");

-- CreateIndex
CREATE INDEX "parameter_change_logs_parameterKey_idx" ON "parameter_change_logs"("parameterKey");

-- CreateIndex
CREATE INDEX "parameter_change_logs_changedAt_idx" ON "parameter_change_logs"("changedAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "security_logs_eventType_idx" ON "security_logs"("eventType");

-- CreateIndex
CREATE INDEX "security_logs_severity_idx" ON "security_logs"("severity");

-- CreateIndex
CREATE INDEX "security_logs_userId_idx" ON "security_logs"("userId");

-- CreateIndex
CREATE INDEX "security_logs_ipAddress_idx" ON "security_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "security_logs_createdAt_idx" ON "security_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "individual_profiles" ADD CONSTRAINT "individual_profiles_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_applications" ADD CONSTRAINT "credit_applications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_applications" ADD CONSTRAINT "credit_applications_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_limit_changes" ADD CONSTRAINT "credit_limit_changes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_limit_changes" ADD CONSTRAINT "credit_limit_changes_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_actions" ADD CONSTRAINT "collection_actions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_actions" ADD CONSTRAINT "collection_actions_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_promises" ADD CONSTRAINT "payment_promises_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
