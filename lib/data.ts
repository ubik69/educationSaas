// data.ts
// Source of truth for the Adept personalisation prototype.
// Mocked AWS Certified Cloud Practitioner (CLF-C02) curriculum + a learner's attempts.

export type Certification = {
  id: string;
  name: string;
  code: string;
};

export type Domain = {
  id: string;
  certificationId: string;
  name: string;
  examWeight: number;
};

export type SkillSet = {
  id: string;
  domainId: string;
  name: string;
};

export type Skill = {
  id: string;
  skillSetId: string;
  name: string;
};

export type Question = {
  id: string;
  certificationId: string;
  domainId: string;
  skillSetId: string;
  skillId: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type QuizAttempt = {
  id: string;
  userId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
};

export const certification: Certification = {
  id: "cert_aws_clf_c02",
  name: "AWS Certified Cloud Practitioner",
  code: "CLF-C02",
};

export const domains: Domain[] = [
  {
    id: "domain_cloud_concepts",
    certificationId: "cert_aws_clf_c02",
    name: "Cloud Concepts",
    examWeight: 24,
  },
  {
    id: "domain_security_compliance",
    certificationId: "cert_aws_clf_c02",
    name: "Security and Compliance",
    examWeight: 30,
  },
  {
    id: "domain_technology_services",
    certificationId: "cert_aws_clf_c02",
    name: "Cloud Technology and Services",
    examWeight: 34,
  },
  {
    id: "domain_billing_support",
    certificationId: "cert_aws_clf_c02",
    name: "Billing, Pricing, and Support",
    examWeight: 12,
  },
];

export const skillSets: SkillSet[] = [
  {
    id: "skillset_cloud_value",
    domainId: "domain_cloud_concepts",
    name: "Cloud Value Proposition",
  },
  {
    id: "skillset_cloud_economics",
    domainId: "domain_cloud_concepts",
    name: "Cloud Economics",
  },
  {
    id: "skillset_shared_responsibility",
    domainId: "domain_security_compliance",
    name: "Shared Responsibility Model",
  },
  {
    id: "skillset_iam",
    domainId: "domain_security_compliance",
    name: "Identity and Access Management",
  },
  {
    id: "skillset_compute",
    domainId: "domain_technology_services",
    name: "Compute Services",
  },
  {
    id: "skillset_storage",
    domainId: "domain_technology_services",
    name: "Storage Services",
  },
  {
    id: "skillset_monitoring",
    domainId: "domain_technology_services",
    name: "Monitoring and Observability",
  },
  {
    id: "skillset_cost_management",
    domainId: "domain_billing_support",
    name: "Cost Management",
  },
  {
    id: "skillset_support_plans",
    domainId: "domain_billing_support",
    name: "AWS Support Plans",
  },
];

export const skills: Skill[] = [
  {
    id: "skill_pay_as_you_go",
    skillSetId: "skillset_cloud_value",
    name: "Pay-as-you-go pricing",
  },
  {
    id: "skill_elasticity",
    skillSetId: "skillset_cloud_value",
    name: "Elasticity and scalability",
  },
  {
    id: "skill_capex_opex",
    skillSetId: "skillset_cloud_economics",
    name: "CapEx vs OpEx",
  },
  {
    id: "skill_customer_responsibilities",
    skillSetId: "skillset_shared_responsibility",
    name: "Customer responsibilities",
  },
  {
    id: "skill_aws_responsibilities",
    skillSetId: "skillset_shared_responsibility",
    name: "AWS responsibilities",
  },
  {
    id: "skill_iam_users_roles",
    skillSetId: "skillset_iam",
    name: "IAM users and roles",
  },
  {
    id: "skill_mfa",
    skillSetId: "skillset_iam",
    name: "Multi-factor authentication",
  },
  {
    id: "skill_ec2_basics",
    skillSetId: "skillset_compute",
    name: "Amazon EC2 basics",
  },
  {
    id: "skill_lambda_basics",
    skillSetId: "skillset_compute",
    name: "AWS Lambda basics",
  },
  {
    id: "skill_s3_basics",
    skillSetId: "skillset_storage",
    name: "Amazon S3 basics",
  },
  {
    id: "skill_s3_storage_classes",
    skillSetId: "skillset_storage",
    name: "S3 storage classes",
  },
  {
    id: "skill_cloudwatch_metrics",
    skillSetId: "skillset_monitoring",
    name: "CloudWatch metrics",
  },
  {
    id: "skill_aws_budgets",
    skillSetId: "skillset_cost_management",
    name: "AWS Budgets",
  },
  {
    id: "skill_cost_explorer",
    skillSetId: "skillset_cost_management",
    name: "AWS Cost Explorer",
  },
  {
    id: "skill_support_plans",
    skillSetId: "skillset_support_plans",
    name: "AWS Support plan differences",
  },
];

export const questions: Question[] = [
  {
    id: "q1",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_cloud_concepts",
    skillSetId: "skillset_cloud_value",
    skillId: "skill_pay_as_you_go",
    question: "Which AWS pricing model helps customers avoid large upfront infrastructure costs?",
    options: ["Pay-as-you-go", "Reserved billing only", "Fixed yearly contracts", "Manual invoicing"],
    correctAnswer: "Pay-as-you-go",
  },
  {
    id: "q2",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_cloud_concepts",
    skillSetId: "skillset_cloud_value",
    skillId: "skill_elasticity",
    question: "Which cloud concept allows resources to scale up or down based on demand?",
    options: ["Elasticity", "Hard coding", "Manual procurement", "Static hosting"],
    correctAnswer: "Elasticity",
  },
  {
    id: "q3",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_cloud_concepts",
    skillSetId: "skillset_cloud_economics",
    skillId: "skill_capex_opex",
    question: "Moving from buying physical servers to paying for cloud usage is mainly a shift from what to what?",
    options: ["CapEx to OpEx", "OpEx to CapEx", "SaaS to hardware", "Regions to Availability Zones"],
    correctAnswer: "CapEx to OpEx",
  },
  {
    id: "q4",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_security_compliance",
    skillSetId: "skillset_shared_responsibility",
    skillId: "skill_customer_responsibilities",
    question: "Under the AWS Shared Responsibility Model, who is responsible for managing customer data?",
    options: ["The customer", "AWS only", "AWS Support", "The AWS Marketplace seller"],
    correctAnswer: "The customer",
  },
  {
    id: "q5",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_security_compliance",
    skillSetId: "skillset_shared_responsibility",
    skillId: "skill_aws_responsibilities",
    question: "Under the AWS Shared Responsibility Model, what is AWS responsible for?",
    options: ["Security of the cloud", "Customer application code", "Customer IAM users", "Customer data classification"],
    correctAnswer: "Security of the cloud",
  },
  {
    id: "q6",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_security_compliance",
    skillSetId: "skillset_iam",
    skillId: "skill_iam_users_roles",
    question: "What is the best way to grant temporary access to AWS resources?",
    options: ["IAM role", "Root user", "Hard-coded access keys", "Public S3 bucket"],
    correctAnswer: "IAM role",
  },
  {
    id: "q7",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_security_compliance",
    skillSetId: "skillset_iam",
    skillId: "skill_mfa",
    question: "Which security feature adds an extra layer of protection during sign-in?",
    options: ["MFA", "EC2", "S3", "CloudFront"],
    correctAnswer: "MFA",
  },
  {
    id: "q8",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_technology_services",
    skillSetId: "skillset_compute",
    skillId: "skill_ec2_basics",
    question: "Which AWS service provides resizable virtual servers in the cloud?",
    options: ["Amazon EC2", "Amazon S3", "AWS IAM", "AWS Budgets"],
    correctAnswer: "Amazon EC2",
  },
  {
    id: "q9",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_technology_services",
    skillSetId: "skillset_compute",
    skillId: "skill_lambda_basics",
    question: "Which AWS service lets you run code without provisioning or managing servers?",
    options: ["AWS Lambda", "Amazon EC2", "Amazon RDS", "Amazon VPC"],
    correctAnswer: "AWS Lambda",
  },
  {
    id: "q10",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_technology_services",
    skillSetId: "skillset_storage",
    skillId: "skill_s3_basics",
    question: "Which AWS service is commonly used for object storage?",
    options: ["Amazon S3", "Amazon EC2", "AWS Lambda", "Amazon CloudWatch"],
    correctAnswer: "Amazon S3",
  },
  {
    id: "q11",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_technology_services",
    skillSetId: "skillset_storage",
    skillId: "skill_s3_storage_classes",
    question: "Which S3 feature helps optimize storage costs based on access patterns?",
    options: ["S3 storage classes", "IAM users", "Security groups", "AWS Organizations"],
    correctAnswer: "S3 storage classes",
  },
  {
    id: "q12",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_technology_services",
    skillSetId: "skillset_monitoring",
    skillId: "skill_cloudwatch_metrics",
    question: "Which AWS service collects metrics and logs for monitoring resources?",
    options: ["Amazon CloudWatch", "Amazon S3", "AWS Budgets", "AWS Shield"],
    correctAnswer: "Amazon CloudWatch",
  },
  {
    id: "q13",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_billing_support",
    skillSetId: "skillset_cost_management",
    skillId: "skill_aws_budgets",
    question: "Which AWS service can alert you when your spending exceeds a defined threshold?",
    options: ["AWS Budgets", "AWS IAM", "Amazon EC2", "Amazon Route 53"],
    correctAnswer: "AWS Budgets",
  },
  {
    id: "q14",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_billing_support",
    skillSetId: "skillset_cost_management",
    skillId: "skill_cost_explorer",
    question: "Which AWS service helps visualize, understand, and manage AWS costs over time?",
    options: ["AWS Cost Explorer", "AWS Lambda", "Amazon CloudWatch Logs", "Amazon S3 Glacier"],
    correctAnswer: "AWS Cost Explorer",
  },
  {
    id: "q15",
    certificationId: "cert_aws_clf_c02",
    domainId: "domain_billing_support",
    skillSetId: "skillset_support_plans",
    skillId: "skill_support_plans",
    question: "Which AWS Support plan is most appropriate for business-critical workloads?",
    options: ["Business Support", "Basic Support", "Free Tier Support", "No support plan"],
    correctAnswer: "Business Support",
  },
];

export const attempts: QuizAttempt[] = [
  {
    id: "a1",
    userId: "user_1",
    questionId: "q1",
    selectedAnswer: "Pay-as-you-go",
    isCorrect: true,
    answeredAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "a2",
    userId: "user_1",
    questionId: "q2",
    selectedAnswer: "Elasticity",
    isCorrect: true,
    answeredAt: "2026-06-01T10:03:00Z",
  },
  {
    id: "a3",
    userId: "user_1",
    questionId: "q3",
    selectedAnswer: "OpEx to CapEx",
    isCorrect: false,
    answeredAt: "2026-06-01T10:06:00Z",
  },
  {
    id: "a4",
    userId: "user_1",
    questionId: "q4",
    selectedAnswer: "AWS only",
    isCorrect: false,
    answeredAt: "2026-06-02T11:00:00Z",
  },
  {
    id: "a5",
    userId: "user_1",
    questionId: "q5",
    selectedAnswer: "Security of the cloud",
    isCorrect: true,
    answeredAt: "2026-06-02T11:04:00Z",
  },
  {
    id: "a6",
    userId: "user_1",
    questionId: "q6",
    selectedAnswer: "Hard-coded access keys",
    isCorrect: false,
    answeredAt: "2026-06-03T09:00:00Z",
  },
  {
    id: "a7",
    userId: "user_1",
    questionId: "q7",
    selectedAnswer: "MFA",
    isCorrect: true,
    answeredAt: "2026-06-03T09:05:00Z",
  },
  {
    id: "a8",
    userId: "user_1",
    questionId: "q8",
    selectedAnswer: "Amazon EC2",
    isCorrect: true,
    answeredAt: "2026-06-04T12:00:00Z",
  },
  {
    id: "a9",
    userId: "user_1",
    questionId: "q9",
    selectedAnswer: "Amazon EC2",
    isCorrect: false,
    answeredAt: "2026-06-04T12:04:00Z",
  },
  {
    id: "a10",
    userId: "user_1",
    questionId: "q10",
    selectedAnswer: "Amazon S3",
    isCorrect: true,
    answeredAt: "2026-06-05T15:00:00Z",
  },
  {
    id: "a11",
    userId: "user_1",
    questionId: "q11",
    selectedAnswer: "IAM users",
    isCorrect: false,
    answeredAt: "2026-06-05T15:05:00Z",
  },
  {
    id: "a12",
    userId: "user_1",
    questionId: "q12",
    selectedAnswer: "AWS Budgets",
    isCorrect: false,
    answeredAt: "2026-06-06T08:00:00Z",
  },
  {
    id: "a13",
    userId: "user_1",
    questionId: "q13",
    selectedAnswer: "AWS Budgets",
    isCorrect: true,
    answeredAt: "2026-06-06T08:05:00Z",
  },
  {
    id: "a14",
    userId: "user_1",
    questionId: "q14",
    selectedAnswer: "AWS Lambda",
    isCorrect: false,
    answeredAt: "2026-06-07T14:00:00Z",
  },
  {
    id: "a15",
    userId: "user_1",
    questionId: "q15",
    selectedAnswer: "Basic Support",
    isCorrect: false,
    answeredAt: "2026-06-07T14:05:00Z",
  },
  {
    id: "a16",
    userId: "user_1",
    questionId: "q6",
    selectedAnswer: "Root user",
    isCorrect: false,
    answeredAt: "2026-06-08T09:00:00Z",
  },
  {
    id: "a17",
    userId: "user_1",
    questionId: "q12",
    selectedAnswer: "Amazon CloudWatch",
    isCorrect: true,
    answeredAt: "2026-06-08T09:05:00Z",
  },
  {
    id: "a18",
    userId: "user_1",
    questionId: "q4",
    selectedAnswer: "The customer",
    isCorrect: true,
    answeredAt: "2026-06-09T10:00:00Z",
  },
];

export const currentUser = {
  id: "user_1",
  name: "Demo Student",
};
