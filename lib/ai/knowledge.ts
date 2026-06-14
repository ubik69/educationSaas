// knowledge.ts
// A small, hand-written knowledge base used by the MOCK AI provider so generated
// study content is genuinely relevant to each AWS CLF-C02 skill instead of lorem.
// When you switch to a real model (see provider.ts) this file is no longer needed,
// but it also doubles as a good few-shot grounding source if you want it.

export type SkillKnowledge = {
  concept: string;
  lesson: string;
  flashcards: { front: string; back: string }[];
  remediation: string;
};

export const skillKnowledge: Record<string, SkillKnowledge> = {
  skill_pay_as_you_go: {
    concept:
      "AWS charges for what you actually use, with no long-term commitment required.",
    lesson:
      "Pay-as-you-go means you pay only for the compute, storage, and services you consume, by the second or hour, with no large upfront purchase. This converts a big capital outlay into a flexible operating cost and lets you start small, then scale spend up or down as real demand changes.",
    flashcards: [
      {
        front: "What does 'pay-as-you-go' mean on AWS?",
        back: "You pay only for the resources you consume, with no upfront commitment or long-term contract.",
      },
      {
        front: "What is the main financial benefit of pay-as-you-go?",
        back: "It avoids large upfront infrastructure costs and turns CapEx into flexible OpEx.",
      },
      {
        front: "How can you reduce per-unit price below on-demand pay-as-you-go?",
        back: "Commit ahead of time with Savings Plans or Reserved Instances in exchange for a lower rate.",
      },
    ],
    remediation:
      "Remember the keyword 'avoid upfront costs'. If a question contrasts paying monthly for usage vs. buying servers, pay-as-you-go is the cloud answer.",
  },
  skill_elasticity: {
    concept:
      "Elasticity automatically adds or removes resources to match demand in near real time.",
    lesson:
      "Elasticity is the ability to scale resources up or down automatically as workload changes, so you neither over-provision (wasting money) nor under-provision (hurting performance). Scalability is the broader capacity to grow; elasticity is doing it dynamically and automatically, e.g. EC2 Auto Scaling adding instances during a traffic spike and removing them after.",
    flashcards: [
      {
        front: "What is elasticity in cloud computing?",
        back: "The automatic scaling of resources up or down to match current demand.",
      },
      {
        front: "Elasticity vs. scalability — what's the difference?",
        back: "Scalability is the ability to grow; elasticity is growing/shrinking automatically and dynamically with demand.",
      },
      {
        front: "Which AWS feature adds/removes EC2 instances based on demand?",
        back: "EC2 Auto Scaling (often paired with a load balancer).",
      },
    ],
    remediation:
      "Watch for 'scale up or down based on demand' — that phrasing almost always points to elasticity.",
  },
  skill_capex_opex: {
    concept:
      "The cloud shifts spending from buying assets up front (CapEx) to paying for usage over time (OpEx).",
    lesson:
      "Capital Expenditure (CapEx) is money spent up front to buy fixed assets like physical servers and data centers. Operating Expenditure (OpEx) is ongoing spend for what you use. Moving to AWS replaces big one-time hardware purchases with metered, usage-based costs — so the shift is CapEx → OpEx, not the other way around.",
    flashcards: [
      {
        front: "What is CapEx?",
        back: "Capital Expenditure — upfront spend to buy fixed assets like servers and data centers.",
      },
      {
        front: "What is OpEx?",
        back: "Operating Expenditure — ongoing, usage-based spend, such as paying AWS for what you consume.",
      },
      {
        front: "Moving from physical servers to AWS is a shift from what to what?",
        back: "From CapEx (buying hardware) to OpEx (paying for cloud usage).",
      },
    ],
    remediation:
      "The trap answer reverses it (OpEx → CapEx). Buying hardware = CapEx; cloud usage = OpEx. The cloud direction is always CapEx → OpEx.",
  },
  skill_customer_responsibilities: {
    concept:
      "Under shared responsibility, the customer secures everything they put IN the cloud — including their data.",
    lesson:
      "The Shared Responsibility Model splits security between AWS and you. The customer is responsible for security 'in' the cloud: their data, data classification and encryption, IAM users and permissions, operating systems, network/firewall config, and application code. Managing and protecting customer data is always the customer's job.",
    flashcards: [
      {
        front: "Who manages and protects customer data under the Shared Responsibility Model?",
        back: "The customer — security 'in' the cloud is the customer's responsibility.",
      },
      {
        front: "Name three customer responsibilities in the model.",
        back: "Customer data, IAM/permissions, and guest OS / application configuration & encryption.",
      },
      {
        front: "Customer responsibilities are described as security ___ the cloud.",
        back: "'in' the cloud (AWS handles security 'of' the cloud).",
      },
    ],
    remediation:
      "Anchor on the phrase 'in the cloud = customer'. Anything about customer data, IAM, or OS patching falls on the customer, not AWS.",
  },
  skill_aws_responsibilities: {
    concept:
      "AWS is responsible for security OF the cloud — the underlying global infrastructure.",
    lesson:
      "AWS handles security 'of' the cloud: the hardware, software, networking, and physical facilities that run AWS services — data center security, the host operating system, virtualization layer, and the global infrastructure (Regions, Availability Zones). AWS does not manage your data, your IAM users, or your application code.",
    flashcards: [
      {
        front: "What is AWS responsible for in the Shared Responsibility Model?",
        back: "Security 'of' the cloud: the global infrastructure, hardware, virtualization, and facilities.",
      },
      {
        front: "Is AWS responsible for customer IAM users or app code?",
        back: "No — those are the customer's responsibility ('in' the cloud).",
      },
      {
        front: "AWS responsibilities are described as security ___ the cloud.",
        back: "'of' the cloud.",
      },
    ],
    remediation:
      "Memorize the pair: AWS = security OF the cloud (infrastructure); customer = security IN the cloud (data & config).",
  },
  skill_iam_users_roles: {
    concept:
      "IAM roles grant temporary, assumable permissions without long-lived credentials.",
    lesson:
      "IAM users represent a person or app with long-term credentials, while IAM roles are assumable identities that hand out temporary security credentials. To grant short-term or cross-service access (an EC2 instance reaching S3, or a user from another account), you use a role — not hard-coded access keys and not the all-powerful root user. Roles avoid embedding secrets and reduce blast radius.",
    flashcards: [
      {
        front: "Best way to grant temporary access to AWS resources?",
        back: "Use an IAM role, which issues short-lived temporary credentials.",
      },
      {
        front: "IAM user vs. IAM role?",
        back: "A user has long-term credentials for a person/app; a role is assumed to get temporary credentials.",
      },
      {
        front: "Why avoid hard-coded access keys for service-to-service access?",
        back: "They're long-lived secrets that can leak; roles provide rotating temporary credentials instead.",
      },
    ],
    remediation:
      "When you see 'temporary access', pick the IAM role. Root user and hard-coded keys are almost always wrong/distractor answers.",
  },
  skill_mfa: {
    concept:
      "MFA adds a second proof of identity on top of a password during sign-in.",
    lesson:
      "Multi-Factor Authentication (MFA) requires a second factor — typically a time-based code from an authenticator app or a hardware key — in addition to the password. Even if a password is stolen, an attacker can't sign in without the second factor. AWS strongly recommends enabling MFA on the root user and privileged IAM users.",
    flashcards: [
      {
        front: "What security feature adds an extra layer during sign-in?",
        back: "Multi-Factor Authentication (MFA).",
      },
      {
        front: "What are the 'factors' in MFA?",
        back: "Something you know (password) plus something you have/are (a code or hardware token).",
      },
      {
        front: "Which AWS account identity should always have MFA enabled?",
        back: "The root user (and any privileged IAM users).",
      },
    ],
    remediation:
      "If a question mentions 'extra layer of protection at sign-in', the answer is MFA — don't confuse it with services like EC2 or S3.",
  },
  skill_ec2_basics: {
    concept:
      "Amazon EC2 provides resizable virtual servers you fully control.",
    lesson:
      "Amazon Elastic Compute Cloud (EC2) gives you resizable virtual machines in the cloud. You choose an instance type (CPU/memory), an Amazon Machine Image, and storage, then you manage the OS and software. EC2 is the workhorse for traditional server workloads, contrasted with serverless options like Lambda.",
    flashcards: [
      {
        front: "What does Amazon EC2 provide?",
        back: "Resizable virtual servers (instances) in the cloud that you manage.",
      },
      {
        front: "What does the 'EC2' acronym stand for?",
        back: "Elastic Compute Cloud.",
      },
      {
        front: "EC2 vs. Lambda at a glance?",
        back: "EC2 = you manage virtual servers; Lambda = run code with no servers to manage.",
      },
    ],
    remediation:
      "Tie 'resizable virtual servers' directly to EC2. S3 is storage, IAM is access — those are distractors here.",
  },
  skill_lambda_basics: {
    concept:
      "AWS Lambda runs your code without provisioning or managing servers.",
    lesson:
      "AWS Lambda is serverless compute: you upload a function and AWS runs it in response to events, scaling automatically and charging only for execution time. There are no servers to provision, patch, or scale. Use it for event-driven and short-lived workloads where you don't want to manage infrastructure.",
    flashcards: [
      {
        front: "Which AWS service runs code without managing servers?",
        back: "AWS Lambda (serverless compute).",
      },
      {
        front: "How are you billed for Lambda?",
        back: "By the number of requests and the compute time your function actually uses.",
      },
      {
        front: "Lambda is best for what kind of workloads?",
        back: "Event-driven, short-lived tasks where you don't want to manage servers.",
      },
    ],
    remediation:
      "The keyword is 'without provisioning or managing servers' → Lambda. EC2 (the common trap) still requires you to manage servers.",
  },
  skill_s3_basics: {
    concept:
      "Amazon S3 is durable, scalable object storage for any kind of file.",
    lesson:
      "Amazon Simple Storage Service (S3) stores data as objects inside buckets. It's designed for very high durability and virtually unlimited scale, and is used for backups, static website assets, data lakes, and media. Objects are accessed over HTTP(S) via keys — it's object storage, not a file system or block storage.",
    flashcards: [
      {
        front: "What type of storage is Amazon S3?",
        back: "Object storage — data stored as objects in buckets.",
      },
      {
        front: "What is S3 commonly used for?",
        back: "Backups, static website hosting, data lakes, and media/object storage at scale.",
      },
      {
        front: "What does 'S3' stand for?",
        back: "Simple Storage Service.",
      },
    ],
    remediation:
      "Map 'object storage' straight to S3. EC2 is compute and CloudWatch is monitoring — distractors.",
  },
  skill_s3_storage_classes: {
    concept:
      "S3 storage classes optimize cost by matching storage tier to access frequency.",
    lesson:
      "S3 offers multiple storage classes for different access patterns: Standard for frequently accessed data, Standard-IA / One Zone-IA for infrequent access, Glacier tiers for archival, and Intelligent-Tiering to move data automatically based on usage. Choosing the right class — or letting Intelligent-Tiering decide — lowers cost without changing your application.",
    flashcards: [
      {
        front: "What do S3 storage classes optimize?",
        back: "Cost, by matching the storage tier to how often data is accessed.",
      },
      {
        front: "Which S3 class moves data automatically based on access patterns?",
        back: "S3 Intelligent-Tiering.",
      },
      {
        front: "Where would you store rarely accessed archival data cheaply?",
        back: "An S3 Glacier storage class.",
      },
    ],
    remediation:
      "'Optimize storage cost based on access patterns' = S3 storage classes. IAM users / security groups are unrelated distractors.",
  },
  skill_cloudwatch_metrics: {
    concept:
      "Amazon CloudWatch collects metrics, logs, and alarms to observe your resources.",
    lesson:
      "Amazon CloudWatch is AWS's monitoring and observability service. It collects metrics (CPU, network, custom values), aggregates logs, builds dashboards, and triggers alarms or automated actions when thresholds are crossed. It's how you see what your infrastructure and applications are doing in near real time.",
    flashcards: [
      {
        front: "Which AWS service collects metrics and logs for monitoring?",
        back: "Amazon CloudWatch.",
      },
      {
        front: "What can a CloudWatch alarm do?",
        back: "Notify you or trigger an automated action when a metric crosses a threshold.",
      },
      {
        front: "CloudWatch is best described as which kind of service?",
        back: "Monitoring and observability.",
      },
    ],
    remediation:
      "Connect 'collects metrics and logs' to CloudWatch. Don't confuse it with billing tools like AWS Budgets.",
  },
  skill_aws_budgets: {
    concept:
      "AWS Budgets alerts you when spending or usage crosses thresholds you set.",
    lesson:
      "AWS Budgets lets you set custom cost or usage budgets and get alerted when actual or forecasted spend exceeds a threshold. It's proactive: you define a limit, and Budgets notifies you (or triggers actions) before bills surprise you. Compare with Cost Explorer, which is for analyzing spend after the fact.",
    flashcards: [
      {
        front: "Which AWS service alerts you when spending exceeds a threshold?",
        back: "AWS Budgets.",
      },
      {
        front: "Budgets vs. Cost Explorer?",
        back: "Budgets sets proactive alerts on limits; Cost Explorer analyzes and visualizes past/forecast spend.",
      },
      {
        front: "What can AWS Budgets track besides cost?",
        back: "Usage and reservation/Savings Plans coverage and utilization.",
      },
    ],
    remediation:
      "'Alert when spending exceeds a threshold' = AWS Budgets (proactive). If it says 'analyze/visualize costs over time', that's Cost Explorer.",
  },
  skill_cost_explorer: {
    concept:
      "AWS Cost Explorer visualizes and analyzes your AWS spending over time.",
    lesson:
      "AWS Cost Explorer is a reporting and analysis tool: it shows historical spend, breaks costs down by service/tag/account, and forecasts future spend. Use it to understand where money is going and spot trends. It analyzes costs; AWS Budgets is the tool that proactively alerts you on thresholds.",
    flashcards: [
      {
        front: "Which AWS service helps visualize and analyze costs over time?",
        back: "AWS Cost Explorer.",
      },
      {
        front: "Cost Explorer vs. AWS Budgets?",
        back: "Cost Explorer analyzes/visualizes spend; Budgets sets proactive threshold alerts.",
      },
      {
        front: "Can Cost Explorer forecast spend?",
        back: "Yes — it forecasts future costs based on historical usage trends.",
      },
    ],
    remediation:
      "'Visualize, understand, manage costs over time' = Cost Explorer. The classic trap is swapping it with AWS Budgets.",
  },
  skill_support_plans: {
    concept:
      "AWS Support plans (Basic, Developer, Business, Enterprise) scale response times and access.",
    lesson:
      "AWS offers tiered Support plans. Basic is free (docs and account/billing support). Developer adds business-hours email guidance. Business adds 24/7 phone/chat support, fast response SLAs, and full Trusted Advisor — appropriate for production, business-critical workloads. Enterprise adds a Technical Account Manager and the fastest response times for mission-critical workloads.",
    flashcards: [
      {
        front: "Which Support plan suits business-critical production workloads?",
        back: "AWS Business Support (24/7 support, full Trusted Advisor, fast SLAs).",
      },
      {
        front: "Which Support plan is free for every account?",
        back: "Basic Support.",
      },
      {
        front: "Which plan includes a Technical Account Manager (TAM)?",
        back: "Enterprise Support (and Enterprise On-Ramp at a lighter level).",
      },
    ],
    remediation:
      "Map 'business-critical workloads' to Business Support. Basic is free/limited; Enterprise is for the largest mission-critical needs.",
  },
};

export const fallbackKnowledge: SkillKnowledge = {
  concept: "Review the core idea behind this skill and how it appears on the exam.",
  lesson:
    "This skill is part of the AWS Certified Cloud Practitioner blueprint. Focus on the single sentence definition, one real AWS service that embodies it, and the most common distractor the exam uses against it.",
  flashcards: [
    {
      front: "What is the one-sentence definition of this skill?",
      back: "Summarize it in your own words, then check it against the AWS documentation.",
    },
    {
      front: "Which AWS service best represents this skill?",
      back: "Name the primary service and what problem it solves.",
    },
    {
      front: "What is the most common trap answer for this topic?",
      back: "Identify the closest-sounding wrong option and why it's wrong.",
    },
  ],
  remediation:
    "Re-read the relevant AWS docs section, then re-attempt the linked questions until you can explain each answer out loud.",
};
