import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_resume_pdf(candidate_data: dict, output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=26,
        bottomMargin=26,
    )

    styles = getSampleStyleSheet()

    header_name = ParagraphStyle(
        "HeaderName",
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
    )

    header_sub = ParagraphStyle(
        "HeaderSub",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=12,
        textColor=colors.HexColor("#2563eb"),
    )

    contact_info = ParagraphStyle(
        "ContactInfo",
        fontName="Helvetica",
        fontSize=8.2,
        leading=10.5,
        textColor=colors.HexColor("#334155"),
    )

    section_title = ParagraphStyle(
        "SectionTitle",
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=11.5,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=1.5,
    )

    body = ParagraphStyle(
        "Body",
        fontName="Helvetica",
        fontSize=8.0,
        leading=10.2,
        textColor=colors.HexColor("#1e293b"),
    )

    body_bold = ParagraphStyle(
        "BodyBold",
        fontName="Helvetica-Bold",
        fontSize=8.2,
        leading=10.5,
        textColor=colors.HexColor("#0f172a"),
    )

    bullet = ParagraphStyle(
        "Bullet",
        fontName="Helvetica",
        fontSize=7.8,
        leading=9.8,
        textColor=colors.HexColor("#334155"),
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=1.2,
    )

    story = []

    # 1. Header
    story.append(Paragraph(candidate_data["name"].upper(), header_name))
    story.append(Paragraph(candidate_data["title"], header_sub))
    story.append(Spacer(1, 1.5))
    story.append(Paragraph(candidate_data["contact"], contact_info))
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=4))

    # 2. Professional Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", section_title))
    story.append(Paragraph(candidate_data["summary"], body))
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=4))

    # 3. Technical Skills
    story.append(Paragraph("TECHNICAL SKILLS", section_title))
    for category, items in candidate_data["skills"]:
        story.append(Paragraph(f"<b>{category}:</b> {items}", body))
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=4))

    # 4. Work Experience
    story.append(Paragraph("WORK EXPERIENCE", section_title))
    for exp in candidate_data["experience"]:
        exp_header = f"<b>{exp['role']}</b> &nbsp;|&nbsp; {exp['company']} &nbsp;|&nbsp; <i>{exp['dates']}</i>"
        story.append(Paragraph(exp_header, body_bold))
        for point in exp["bullets"]:
            story.append(Paragraph(f"• {point}", bullet))
        story.append(Spacer(1, 1.5))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=4))

    # 5. Technical Projects
    story.append(Paragraph("TECHNICAL PROJECTS", section_title))
    for proj in candidate_data["projects"]:
        proj_header = f"<b>{proj['name']}</b> &nbsp;|&nbsp; <i>{proj['tech']}</i>"
        story.append(Paragraph(proj_header, body_bold))
        for point in proj["bullets"]:
            story.append(Paragraph(f"• {point}", bullet))
        story.append(Spacer(1, 1.5))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=4))

    # 6. Education & Certifications
    story.append(Paragraph("EDUCATION &amp; CERTIFICATIONS", section_title))
    edu = candidate_data["education"]
    edu_header = f"<b>{edu['degree']}</b> &nbsp;|&nbsp; {edu['school']} &nbsp;|&nbsp; <i>{edu['dates']}</i>"
    story.append(Paragraph(edu_header, body_bold))
    if "details" in edu:
        story.append(Paragraph(f"<b>Details:</b> {edu['details']}", bullet))
    if "certifications" in candidate_data:
        story.append(Paragraph(f"<b>Certifications:</b> {candidate_data['certifications']}", bullet))

    doc.build(story)
    print(f"[OK] Generated: {os.path.basename(output_path)}")


RESUMES_DATA = [
    # 1. Alex Chen - Full Stack
    {
        "filename": "Alex_Chen_Resume.pdf",
        "name": "Alex Chen",
        "title": "Senior Full-Stack Engineer &amp; Microservices Architect",
        "contact": "<b>Email:</b> alex.chen@techmail.io &nbsp;|&nbsp; <b>Phone:</b> +1 (415) 890-1234 &nbsp;|&nbsp; <b>Location:</b> San Francisco, CA &nbsp;|&nbsp; <b>GitHub:</b> github.com/alexchen-dev",
        "summary": "Full-Stack Engineer with 6+ years of experience architecting resilient, event-driven web applications and scalable RESTful/GraphQL APIs. Adept in React 19, TypeScript, Python FastAPI, and PostgreSQL. Champion of automated testing, continuous integration, and sub-100ms API response times.",
        "skills": [
            ("Languages", "Python, TypeScript, JavaScript, SQL, HTML5, CSS3, Go"),
            ("Frontend", "React 19, Next.js, Redux Toolkit, Tailwind CSS, Vite, WebSockets"),
            ("Backend &amp; APIs", "FastAPI, Node.js, Express, GraphQL, SQLAlchemy, Pydantic, RESTful Architecture"),
            ("Cloud &amp; DevOps", "AWS (EC2, S3, RDS, Lambda), Docker, Docker Compose, GitHub Actions, Redis, PostgreSQL"),
        ],
        "experience": [
            {
                "role": "Senior Full-Stack Engineer",
                "company": "Nexus Scale Platforms",
                "dates": "2021 – Present",
                "bullets": [
                    "Engineered microservices backend using FastAPI and PostgreSQL handling 25,000+ daily concurrent user transactions.",
                    "Refactored legacy dashboard into modern React 19 and Next.js SPA, slashing initial page load times by 48%.",
                    "Integrated Redis caching layer for session and catalogue lookups, boosting throughput by 3.5x under peak surges.",
                ],
            },
            {
                "role": "Software Engineer",
                "company": "Kinetix Digital Labs",
                "dates": "2019 – 2021",
                "bullets": [
                    "Developed reusable TypeScript UI design system components adopted across 6 cross-functional product squads.",
                    "Configured end-to-end automated testing with Jest and Playwright, lifting code test coverage from 62% to 94%.",
                ],
            },
        ],
        "projects": [
            {
                "name": "OmniSync Collaborative Engine",
                "tech": "React, TypeScript, WebSockets, Node.js, Redis",
                "bullets": [
                    "Constructed real-time operational transformation text editor supporting simultaneous editing by 50+ users per room.",
                    "Optimized network payload serialization, achieving under 18ms latency for WebSocket delta broadcasting.",
                ],
            },
            {
                "name": "FinPulse Automated Billing Hub",
                "tech": "FastAPI, PostgreSQL, Stripe API, Docker, Celery",
                "bullets": [
                    "Implemented resilient webhook retry queues processing $1.8M in monthly multi-tier SaaS subscription billings.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Science",
            "school": "University of California, Berkeley",
            "dates": "2015 – 2019",
            "details": "GPA 3.8/4.0. Coursework: Distributed Systems, Operating Systems, Algorithms, Computer Security.",
        },
        "certifications": "AWS Certified Solutions Architect – Associate (2023)",
    },

    # 2. Priya Sharma - Machine Learning / AI
    {
        "filename": "Priya_Sharma_Resume.pdf",
        "name": "Priya Sharma",
        "title": "Lead Machine Learning &amp; AI Research Engineer",
        "contact": "<b>Email:</b> priya.sharma@aimail.org &nbsp;|&nbsp; <b>Phone:</b> +1 (206) 555-7821 &nbsp;|&nbsp; <b>Location:</b> Seattle, WA &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/priya-sharma-ai",
        "summary": "Applied AI and Machine Learning Engineer specializing in Large Language Model (LLM) fine-tuning, Retrieval-Augmented Generation (RAG), and production NLP pipelines. Strong foundation in PyTorch, HuggingFace, Scikit-Learn, and high-performance inference serving with TensorRT.",
        "skills": [
            ("Languages", "Python, C++, SQL, Bash, R"),
            ("AI / ML &amp; Frameworks", "PyTorch, TensorFlow, HuggingFace Transformers, LangChain, Scikit-Learn, XGBoost, Ray"),
            ("NLP &amp; Embeddings", "BERT, LLaMA, Sentence-Transformers, Vector DBs (Chroma, Pinecone, Qdrant), TF-IDF, SpaCy"),
            ("MLOps &amp; Infrastructure", "MLflow, Docker, FastAPI, Triton Inference Server, Kubernetes, AWS SageMaker, DVC"),
        ],
        "experience": [
            {
                "role": "Lead AI Engineer",
                "company": "CognitiveMatrix AI",
                "dates": "2022 – Present",
                "bullets": [
                    "Architected enterprise RAG system with LLaMA 3 and hybrid vector-keyword retrieval, lifting answer relevance to 94.2%.",
                    "Quantized and deployed 70B parameter models using vLLM and TensorRT-LLM, reducing GPU inference memory by 60%.",
                    "Supervised active learning dataset curation pipeline labeling 450,000+ domain-specific regulatory documents.",
                ],
            },
            {
                "role": "Machine Learning Engineer",
                "company": "DataSight Analytics",
                "dates": "2019 – 2022",
                "bullets": [
                    "Trained multi-class text classification models for customer intent routing, cutting support resolution time by 32%.",
                    "Built automated model drift monitoring dashboards in MLflow tracking prediction entropy and feature drift.",
                ],
            },
        ],
        "projects": [
            {
                "name": "DocuMatch Semantic Gap Engine",
                "tech": "PyTorch, HuggingFace, FastAPI, Qdrant, Docker",
                "bullets": [
                    "Engineered cosine similarity matcher computing dense text embeddings across 100,000+ resumes and job profiles.",
                    "Delivered sub-40ms vector similarity lookups using HNSW indexing and dimension reduction heuristics.",
                ],
            },
            {
                "name": "CodeReview-LLM Assistant",
                "tech": "Python, LangChain, Mistral-7B, GitHub API",
                "bullets": [
                    "Trained automated pull request reviewer flagging security flaws with 89% precision and zero hallucinated rules.",
                ],
            },
        ],
        "education": {
            "degree": "M.S. in Artificial Intelligence &amp; Data Science",
            "school": "University of Washington",
            "dates": "2017 – 2019",
            "details": "Thesis: Efficient Low-Rank Adaptation of Transformer Models for Enterprise NLP.",
        },
        "certifications": "DeepLearning.AI TensorFlow Developer Certified &nbsp;|&nbsp; AWS Machine Learning Specialty",
    },

    # 3. Marcus Johnson - DevOps / SRE
    {
        "filename": "Marcus_Johnson_Resume.pdf",
        "name": "Marcus Johnson",
        "title": "Principal DevOps &amp; Site Reliability Engineer",
        "contact": "<b>Email:</b> marcus.j@cloudops.net &nbsp;|&nbsp; <b>Phone:</b> +1 (312) 441-9082 &nbsp;|&nbsp; <b>Location:</b> Chicago, IL &nbsp;|&nbsp; <b>GitHub:</b> github.com/marcus-infra",
        "summary": "Site Reliability Engineer with 7+ years orchestrating resilient Kubernetes clusters, multi-region cloud infrastructure, and zero-downtime deployment pipelines. Deep expertise in Terraform, Helm, ArgoCD, Prometheus, and AWS cloud security compliance.",
        "skills": [
            ("Container &amp; Orchestration", "Kubernetes (EKS/GKE), Docker, Docker Swarm, Helm, Istio Service Mesh, ArgoCD"),
            ("Infrastructure as Code", "Terraform, Terragrunt, CloudFormation, Ansible, Packer"),
            ("Observability &amp; Logging", "Prometheus, Grafana, Datadog, ELK Stack, OpenTelemetry, PagerDuty"),
            ("CI/CD &amp; Cloud", "GitHub Actions, GitLab CI, Jenkins, AWS (IAM, VPC, EKS, CloudFront), Linux Administration"),
        ],
        "experience": [
            {
                "role": "Principal SRE",
                "company": "Vanguard Cloud Systems",
                "dates": "2021 – Present",
                "bullets": [
                    "Maintained 99.995% service SLA across 40+ microservices on AWS EKS serving 120M+ monthly HTTP requests.",
                    "Automated multi-region infrastructure provisioning using modular Terraform, shrinking deployment setup from 3 days to 40 minutes.",
                    "Implemented GitOps deployment pipelines via ArgoCD, achieving zero-downtime blue/green deployments.",
                ],
            },
            {
                "role": "DevOps Engineer",
                "company": "Apex Financial Technologies",
                "dates": "2018 – 2021",
                "bullets": [
                    "Engineered unified Prometheus &amp; Grafana monitoring alerting stack, lowering mean time to detect (MTTD) by 55%.",
                    "Automated secret rotation across production Kubernetes pods via HashiCorp Vault and AWS Secrets Manager.",
                ],
            },
        ],
        "projects": [
            {
                "name": "KubeGuard Auto-Remediation Operator",
                "tech": "Go, Kubernetes Operator SDK, Prometheus",
                "bullets": [
                    "Developed custom Kubernetes controller that detects crashloop pods and triggers automated memory reallocation.",
                ],
            },
            {
                "name": "Terraform Multi-Cloud Baseline",
                "tech": "Terraform, AWS, GCP, GitHub Actions",
                "bullets": [
                    "Created open-source infrastructure template enforcing CIS benchmarks and least-privilege IAM policies.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Engineering",
            "school": "University of Illinois Urbana-Champaign",
            "dates": "2014 – 2018",
            "details": "Specialization in Network Protocols, Distributed Operating Systems, and Cloud Security.",
        },
        "certifications": "Certified Kubernetes Administrator (CKA) &nbsp;|&nbsp; HashiCorp Certified Terraform Associate",
    },

    # 4. Elena Rostova - Backend Distributed Systems
    {
        "filename": "Elena_Rostova_Resume.pdf",
        "name": "Elena Rostova",
        "title": "Senior Distributed Systems &amp; Backend Engineer",
        "contact": "<b>Email:</b> elena.rostova@systems.dev &nbsp;|&nbsp; <b>Phone:</b> +1 (617) 320-4591 &nbsp;|&nbsp; <b>Location:</b> Boston, MA &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/elena-rostova",
        "summary": "Backend Software Engineer specializing in distributed message queues, concurrent event streaming, and high-volume database partitioning. Proficient in Go (Golang), Java, Kafka, gRPC, and PostgreSQL with a passion for deterministic correctness and low-latency systems.",
        "skills": [
            ("Languages", "Go (Golang), Java, C++, SQL, Rust, Bash"),
            ("Backend Architecture", "Microservices, Event-Driven Systems, gRPC, Protocol Buffers, RESTful APIs, Concurrency"),
            ("Messaging &amp; Storage", "Apache Kafka, RabbitMQ, PostgreSQL, Cassandra, Redis, ScyllaDB"),
            ("DevOps &amp; Tooling", "Docker, Kubernetes, Linux eBPF, Prometheus, Jaeger Tracing, Git, Make"),
        ],
        "experience": [
            {
                "role": "Senior Backend Engineer",
                "company": "StreamGrid Data Networks",
                "dates": "2021 – Present",
                "bullets": [
                    "Designed and deployed Go-based streaming ingestion engine processing 140,000 events/second with p99 latency &lt; 8ms.",
                    "Migrated monolithic MySQL store to partitioned PostgreSQL and Cassandra cluster, enabling horizontal scalability to 50TB.",
                    "Implemented distributed tracing across 18 backend microservices using Jaeger and OpenTelemetry.",
                ],
            },
            {
                "role": "Software Engineer",
                "company": "Quantix Trading Systems",
                "dates": "2018 – 2021",
                "bullets": [
                    "Engineered asynchronous order matching gateway in Java and Netty processing high-throughput financial exchange feeds.",
                    "Authored automated stress test harness simulating 5x traffic surges to detect race conditions and thread deadlocks.",
                ],
            },
        ],
        "projects": [
            {
                "name": "RaftLite Consensus Library",
                "tech": "Go (Golang), TCP, Protocol Buffers",
                "bullets": [
                    "Built lightweight Raft consensus algorithm implementation featuring leader election, log replication, and snapshotting.",
                ],
            },
            {
                "name": "Kafka Stream Filter Proxy",
                "tech": "Go, Apache Kafka, Docker, Prometheus",
                "bullets": [
                    "Constructed streaming proxy filtering real-time event topics with sub-millisecond overhead and zero data loss.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Science &amp; Mathematics",
            "school": "Massachusetts Institute of Technology (MIT)",
            "dates": "2014 – 2018",
            "details": "Graduated Magna Cum Laude. Coursework: Distributed Algorithms, Database Internals, Network Theory.",
        },
        "certifications": "Confluent Certified Developer for Apache Kafka (CCDAK)",
    },

    # 5. David Kim - Frontend Architect
    {
        "filename": "David_Kim_Resume.pdf",
        "name": "David Kim",
        "title": "Staff Frontend Architect &amp; Design Systems Lead",
        "contact": "<b>Email:</b> david.kim@uiuxlab.com &nbsp;|&nbsp; <b>Phone:</b> +1 (212) 678-3310 &nbsp;|&nbsp; <b>Location:</b> New York, NY &nbsp;|&nbsp; <b>GitHub:</b> github.com/davidkim-ui",
        "summary": "Frontend Architect with 8+ years crafting enterprise design systems, micro-frontend frameworks, and accessible web experiences. Expert in React 19, TypeScript, Next.js, Tailwind CSS, and Core Web Vitals optimization. Passionate about silky 60fps micro-animations and developer experience.",
        "skills": [
            ("Core Frontend", "TypeScript, JavaScript (ESNext), HTML5, CSS3, Modern CSS, Web APIs, DOM Performance"),
            ("Frameworks &amp; State", "React 19, Next.js (App Router), Vue.js, Redux Toolkit, Zustand, TanStack Query"),
            ("Styling &amp; Design", "Tailwind CSS v4, CSS Modules, Radix UI, Storybook, Figma-to-Code, Responsive Design"),
            ("Build &amp; Testing", "Vite, Webpack, Turbopack, Jest, React Testing Library, Playwright, Lighthouse Optimization"),
        ],
        "experience": [
            {
                "role": "Staff Frontend Architect",
                "company": "Prism Enterprise Software",
                "dates": "2021 – Present",
                "bullets": [
                    "Architected universal enterprise component library in React 19 &amp; Tailwind CSS used by 45 frontend engineers across 8 products.",
                    "Boosted Google Core Web Vitals (LCP &lt; 1.2s, INP &lt; 50ms) across consumer portal, improving customer conversion by 22%.",
                    "Spearheaded migration to Next.js App Router with React Server Components, eliminating 240KB of client JavaScript bundle.",
                ],
            },
            {
                "role": "Senior Frontend Engineer",
                "company": "Beacon Interactive",
                "dates": "2018 – 2021",
                "bullets": [
                    "Developed rich interactive data visualization dashboard with Recharts and D3.js rendering 50,000+ real-time datapoints.",
                    "Standardized WCAG 2.1 AA accessibility guidelines across company web portfolio, resolving 300+ screen-reader hurdles.",
                ],
            },
        ],
        "projects": [
            {
                "name": "Lumina UI Component Kit",
                "tech": "React, TypeScript, Tailwind CSS, Storybook, NPM",
                "bullets": [
                    "Published open-source accessible UI kit with 40+ atomic components achieving 15,000+ monthly npm downloads.",
                ],
            },
            {
                "name": "LiveMetrics Canvas Telemetry",
                "tech": "TypeScript, HTML5 Canvas, WebSockets, React",
                "bullets": [
                    "Created smooth 60fps graph renderer displaying concurrent streaming server telemetry with zero dropped animation frames.",
                ],
            },
        ],
        "education": {
            "degree": "B.F.A. in Digital Arts &amp; B.S. in Computer Science",
            "school": "New York University (NYU)",
            "dates": "2013 – 2017",
            "details": "Honors in Human-Computer Interaction and Computer Graphics.",
        },
    },

    # 6. Aisha Al-Mansoor - Cloud Solutions Architect
    {
        "filename": "Aisha_Al_Mansoor_Resume.pdf",
        "name": "Aisha Al-Mansoor",
        "title": "Lead Cloud Solutions &amp; Enterprise Infrastructure Architect",
        "contact": "<b>Email:</b> aisha.almansoor@cloudarc.io &nbsp;|&nbsp; <b>Phone:</b> +1 (408) 723-9011 &nbsp;|&nbsp; <b>Location:</b> San Jose, CA &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/aisha-cloud",
        "summary": "Cloud Solutions Architect with 8+ years leading enterprise cloud migrations, multi-tenant SaaS architecture, and zero-trust security topologies across AWS and Google Cloud. Specialist in serverless computing, FinOps cost optimization, and SOC 2 Type II governance.",
        "skills": [
            ("Cloud Platforms", "AWS (EC2, ECS, Lambda, RDS, DynamoDB, S3, CloudFront), Google Cloud (GCP), Azure"),
            ("Architecture Patterns", "Serverless, Microservices, Event-Driven, Multi-Region Active-Active, Disaster Recovery"),
            ("Security &amp; Governance", "AWS IAM, KMS, WAF, Zero-Trust Architecture, SOC 2, HIPAA, CloudWatch, GuardDuty"),
            ("Automation &amp; IaC", "Terraform, AWS CDK, Python, Bash, Docker, GitHub Actions, Terragrunt"),
        ],
        "experience": [
            {
                "role": "Lead Cloud Architect",
                "company": "Stratosphere Cloud Consulting",
                "dates": "2021 – Present",
                "bullets": [
                    "Directed cloud modernization initiative for Fortune 500 financial client, shifting 220 workloads from on-premise to AWS.",
                    "Engineered serverless microservices framework with AWS Lambda &amp; DynamoDB handling 80M monthly invocations.",
                    "Executed FinOps cloud cost analysis saving $640,000 annually through reserved instances, spot fleets, and lifecycle storage policies.",
                ],
            },
            {
                "role": "Senior Cloud Infrastructure Engineer",
                "company": "CloudHaven Networks",
                "dates": "2018 – 2021",
                "bullets": [
                    "Automated zero-trust network infrastructure using Terraform and AWS Transit Gateway across 14 VPC environments.",
                    "Configured automated disaster recovery failover achieving Recovery Point Objective (RPO) &lt; 5m and RTO &lt; 15m.",
                ],
            },
        ],
        "projects": [
            {
                "name": "FinOps Cloud Analyzer CLI",
                "tech": "Python, AWS Cost Explorer API, Click, Docker",
                "bullets": [
                    "Created automated cost auditing tool scanning orphaned EBS volumes and idle RDS instances across AWS accounts.",
                ],
            },
            {
                "name": "Multi-Tenant SaaS IAM Isolation",
                "tech": "Terraform, AWS IAM, Cognito, DynamoDB",
                "bullets": [
                    "Designed dynamic IAM role assumption pattern providing cryptographic tenant data isolation for 2,000+ organizations.",
                ],
            },
        ],
        "education": {
            "degree": "M.S. in Information Systems &amp; Cloud Security",
            "school": "Stanford University",
            "dates": "2016 – 2018",
            "details": "Focus on Distributed Infrastructure and Cryptographic Systems.",
        },
        "certifications": "AWS Certified Solutions Architect – Professional &nbsp;|&nbsp; Google Cloud Professional Cloud Architect",
    },

    # 7. Liam O'Donnell - Data Engineer
    {
        "filename": "Liam_ODonnell_Resume.pdf",
        "name": "Liam O'Donnell",
        "title": "Senior Data Engineer &amp; Pipeline Specialist",
        "contact": "<b>Email:</b> liam.odonnell@pipedata.io &nbsp;|&nbsp; <b>Phone:</b> +1 (512) 334-8902 &nbsp;|&nbsp; <b>Location:</b> Austin, TX &nbsp;|&nbsp; <b>GitHub:</b> github.com/liam-data",
        "summary": "Data Engineer with 6+ years constructing high-reliability big data pipelines, automated ETL/ELT workflows, and petabyte-scale data warehouse solutions. Deep expertise in Apache Spark, Python, SQL, Snowflake, dbt, Apache Airflow, and Kafka streaming architectures.",
        "skills": [
            ("Big Data Processing", "Apache Spark, PySpark, Databricks, Apache Kafka, Apache Flink, MapReduce"),
            ("Data Warehousing", "Snowflake, Google BigQuery, Amazon Redshift, PostgreSQL, ClickHouse"),
            ("Orchestration &amp; Modeling", "Apache Airflow, Prefect, dbt (data build tool), Great Expectations, Data Modeling (Kimball)"),
            ("Languages &amp; Cloud", "Python, SQL, Scala, Bash, AWS S3, Docker, Terraform, Git"),
        ],
        "experience": [
            {
                "role": "Senior Data Engineer",
                "company": "Helix Analytics Group",
                "dates": "2021 – Present",
                "bullets": [
                    "Architected automated real-time ingestion pipeline streaming 80M daily records from Kafka to Snowflake using dbt.",
                    "Reduced overnight batch ETL execution runtime from 4.5 hours to 45 minutes through Spark partition optimization.",
                    "Enforced data quality test suites using Great Expectations, preventing corrupt records from entering downstream analytics marts.",
                ],
            },
            {
                "role": "Data Engineer",
                "company": "MetricWave Tech",
                "dates": "2019 – 2021",
                "bullets": [
                    "Designed dimensional star-schema data models in BigQuery empowering self-serve dashboards for 60+ business analysts.",
                    "Automated 120+ Directed Acyclic Graphs (DAGs) in Apache Airflow managing end-to-end telemetry synchronization.",
                ],
            },
        ],
        "projects": [
            {
                "name": "ClickStream Ingest Engine",
                "tech": "PySpark, Kafka, AWS S3, Snowflake, Docker",
                "bullets": [
                    "Built streaming consumer transforming raw JSON web clickstream events into compressed Parquet columnar storage.",
                ],
            },
            {
                "name": "dbt Data Governance Framework",
                "tech": "dbt, SQL, GitHub Actions, BigQuery",
                "bullets": [
                    "Implemented CI validation verifying schema drift and automated lineage documentation on every pull request.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Science &amp; Statistics",
            "school": "University of Texas at Austin",
            "dates": "2015 – 2019",
            "details": "GPA 3.82. Dean's Honor List. Research Assistant in Data Mining Laboratory.",
        },
        "certifications": "Snowflake SnowPro Core Certified &nbsp;|&nbsp; Databricks Certified Data Engineer Professional",
    },

    # 8. Sophia Taylor - Cybersecurity / AppSec
    {
        "filename": "Sophia_Taylor_Resume.pdf",
        "name": "Sophia Taylor",
        "title": "Lead Application Security &amp; Cybersecurity Engineer",
        "contact": "<b>Email:</b> sophia.taylor@secops.io &nbsp;|&nbsp; <b>Phone:</b> +1 (703) 492-1100 &nbsp;|&nbsp; <b>Location:</b> Washington, DC &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/sophia-secops",
        "summary": "Cybersecurity and Application Security (AppSec) Engineer with 7+ years securing cloud-native enterprise infrastructures, performing penetration testing, and integrating DevSecOps guardrails into CI/CD pipelines. Proficient in threat modeling, SAST/DAST, and SOC 2 / NIST frameworks.",
        "skills": [
            ("Security Disciplines", "Application Security, Threat Modeling (STRIDE), Penetration Testing, Vulnerability Management"),
            ("DevSecOps &amp; Scanners", "Snyk, Semgrep, SonarQube, OWASP ZAP, Burp Suite Professional, Checkmarx, Trivy"),
            ("Cloud &amp; Security Tools", "AWS IAM, AWS WAF, HashiCorp Vault, Splunk SIEM, CrowdStrike, Wireshark, Nmap"),
            ("Languages &amp; Standards", "Python, Go, Bash, SQL, OWASP Top 10, NIST 800-53, SOC 2 Type II, ISO 27001"),
        ],
        "experience": [
            {
                "role": "Lead Application Security Engineer",
                "company": "Fortress Cyber Systems",
                "dates": "2021 – Present",
                "bullets": [
                    "Engineered automated DevSecOps pipeline embedding Semgrep and Snyk across 110 GitHub repositories, eliminating 80% of critical CVEs.",
                    "Conducted comprehensive black-box and white-box penetration tests across SaaS platforms, uncovering 18 high-risk vulnerabilities.",
                    "Spearheaded threat modeling workshops with engineering squads, embedding secure-by-design standards early in product lifecycles.",
                ],
            },
            {
                "role": "Security Engineer",
                "company": "Aegis Information Defense",
                "dates": "2018 – 2021",
                "bullets": [
                    "Configured Splunk SIEM ingestion rules and automated alert triage scripts, decreasing incident response time by 40%.",
                    "Administered enterprise PKI certificate lifecycle and automated TLS certificate issuance with HashiCorp Vault.",
                ],
            },
        ],
        "projects": [
            {
                "name": "VulnScan Automated Triage Engine",
                "tech": "Python, Burp Suite REST API, Docker, Jira API",
                "bullets": [
                    "Automated scheduled dynamic application security tests (DAST) generating verified vulnerability tickets in Jira.",
                ],
            },
            {
                "name": "AWS IAM Least-Privilege Auditor",
                "tech": "Python, Boto3, AWS IAM, GitHub Actions",
                "bullets": [
                    "Built CLI utility discovering over-permissioned IAM policies and proposing scoped least-privilege alternatives.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Cybersecurity &amp; Network Defense",
            "school": "George Mason University",
            "dates": "2014 – 2018",
            "details": "Captain of Collegiate Cyber Defense Competition (CCDC) Team.",
        },
        "certifications": "Certified Information Systems Security Professional (CISSP) &nbsp;|&nbsp; Offensive Security Certified Professional (OSCP)",
    },

    # 9. Carlos Rodriguez - Mobile (iOS / React Native)
    {
        "filename": "Carlos_Rodriguez_Resume.pdf",
        "name": "Carlos Rodriguez",
        "title": "Senior Mobile Engineer (iOS &amp; React Native)",
        "contact": "<b>Email:</b> carlos.rodriguez@mobilecraft.dev &nbsp;|&nbsp; <b>Phone:</b> +1 (305) 811-9023 &nbsp;|&nbsp; <b>Location:</b> Miami, FL &nbsp;|&nbsp; <b>GitHub:</b> github.com/carlos-mobile",
        "summary": "Mobile Software Engineer with 6+ years designing consumer and enterprise mobile applications deployed to millions of users on the Apple App Store and Google Play Store. Specialist in Swift, SwiftUI, React Native, TypeScript, offline-first local databases, and mobile CI/CD.",
        "skills": [
            ("Mobile Technologies", "Swift, SwiftUI, UIKit, React Native, TypeScript, Kotlin, Objective-C, CocoaPods"),
            ("Architecture &amp; State", "MVVM, Redux, Clean Swift, Combine, CoreData, SQLite, Realm, GraphQL, REST APIs"),
            ("Mobile DevOps &amp; CI", "Fastlane, Xcode Cloud, TestFlight, App Store Connect, Firebase Crashlytics, Bitrise"),
            ("Testing &amp; Tooling", "XCTest, Jest, Detox, Charles Proxy, Postman, Git, Figma Mobile Prototypes"),
        ],
        "experience": [
            {
                "role": "Senior iOS Engineer",
                "company": "Veloce Consumer Technologies",
                "dates": "2021 – Present",
                "bullets": [
                    "Led iOS development for flagship e-commerce application with 1.2M+ active users, maintaining a 4.8-star App Store rating.",
                    "Migrated legacy UIKit views to modern SwiftUI, improving development velocity by 35% and cutting memory footprint by 22MB.",
                    "Architected offline-first synchronisation engine with SQLite and background tasks, achieving seamless zero-drop transactions.",
                ],
            },
            {
                "role": "React Native Developer",
                "company": "Pulse Fitness Systems",
                "dates": "2019 – 2021",
                "bullets": [
                    "Engineered cross-platform mobile fitness tracker in React Native integrating Apple HealthKit and Google Fit APIs.",
                    "Configured automated Fastlane deployment pipelines cutting app release cycle times from 2 days to 30 minutes.",
                ],
            },
        ],
        "projects": [
            {
                "name": "SwiftCash Budget &amp; Expense Tracker",
                "tech": "SwiftUI, Combine, CoreData, Charts Framework",
                "bullets": [
                    "Published native iOS finance tracker featured on the App Store with 80,000+ lifetime downloads.",
                ],
            },
            {
                "name": "ExpoFast Starter Kit",
                "tech": "React Native, Expo, TypeScript, Tailwind (NativeWind)",
                "bullets": [
                    "Built and open-sourced starter boilerplate for cross-platform mobile apps with built-in authentication and dark mode.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Science",
            "school": "Florida International University",
            "dates": "2015 – 2019",
            "details": "President of Mobile App Developers Club. 1st Place in University Hackathon 2018.",
        },
    },

    # 10. Maya Patel - Data Scientist / NLP
    {
        "filename": "Maya_Patel_Resume.pdf",
        "name": "Maya Patel",
        "title": "Senior Data Scientist &amp; Predictive Modeling Lead",
        "contact": "<b>Email:</b> maya.patel@datascience.net &nbsp;|&nbsp; <b>Phone:</b> +1 (404) 991-3049 &nbsp;|&nbsp; <b>Location:</b> Atlanta, GA &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/maya-patel-ds",
        "summary": "Data Scientist with 6+ years transforming enterprise data into high-value predictive models, recommendation algorithms, and statistical experiment frameworks. Proficient in Python, SQL, Scikit-Learn, LightGBM, Pandas, and interactive Tableau dashboards.",
        "skills": [
            ("Languages &amp; Stats", "Python, R, SQL, Experimental Design, A/B Testing, Hypothesis Testing, Bayesian Statistics"),
            ("Machine Learning", "Scikit-Learn, XGBoost, LightGBM, Random Forests, K-Means Clustering, Time Series (ARIMA, Prophet)"),
            ("Data Wrangling &amp; BI", "Pandas, NumPy, Polars, Tableau, PowerBI, Matplotlib, Seaborn, Plotly"),
            ("Databases &amp; Tooling", "PostgreSQL, Snowflake, BigQuery, Jupyter, Git, Docker, MLflow"),
        ],
        "experience": [
            {
                "role": "Senior Data Scientist",
                "company": "Kinetix Retail Analytics",
                "dates": "2021 – Present",
                "bullets": [
                    "Built customer lifetime value (LTV) and churn prediction models in LightGBM, directly driving a 14% increase in retention.",
                    "Designed and analyzed 40+ rigorous A/B experiments evaluating user interface modifications and pricing tiers.",
                    "Constructed automated feature engineering pipelines in Snowflake and Python processing 20M+ customer event rows weekly.",
                ],
            },
            {
                "role": "Data Scientist",
                "company": "Apex Market Insights",
                "dates": "2019 – 2021",
                "bullets": [
                    "Developed demand forecasting time-series algorithms with Prophet reducing inventory stockout incidents by 28%.",
                    "Delivered executive Tableau dashboards utilized weekly by the C-suite for revenue forecasting and market segmentation.",
                ],
            },
        ],
        "projects": [
            {
                "name": "Customer Segmentation Engine",
                "tech": "Python, Scikit-Learn, PCA, UMAP, Streamlit",
                "bullets": [
                    "Created unsupervised customer clustering tool revealing 5 distinct high-margin buying cohorts for marketing teams.",
                ],
            },
            {
                "name": "Automated A/B Test Evaluator",
                "tech": "Python, SciPy, Statsmodels, Plotly",
                "bullets": [
                    "Constructed statistical testing library computing statistical power, p-values, and false discovery rate corrections.",
                ],
            },
        ],
        "education": {
            "degree": "M.S. in Analytics &amp; Statistics",
            "school": "Georgia Institute of Technology",
            "dates": "2017 – 2019",
            "details": "Graduate Teaching Assistant for Statistical Modeling. Capstone Project with Delta Air Lines.",
        },
    },

    # 11. James Wilson - Embedded / IoT
    {
        "filename": "James_Wilson_Resume.pdf",
        "name": "James Wilson",
        "title": "Senior Embedded Systems &amp; IoT Firmware Engineer",
        "contact": "<b>Email:</b> james.wilson@embeddedcore.io &nbsp;|&nbsp; <b>Phone:</b> +1 (734) 620-8819 &nbsp;|&nbsp; <b>Location:</b> Ann Arbor, MI &nbsp;|&nbsp; <b>GitHub:</b> github.com/jwilson-embed",
        "summary": "Embedded Software Engineer with 7+ years developing low-power firmware, real-time operating systems (RTOS), and hardware-in-the-loop validation for smart IoT devices and automotive microcontrollers. Expert in C, C++, ARM Cortex-M, and communication protocols.",
        "skills": [
            ("Firmware &amp; Languages", "C (C99/C11), C++ (C++17), Rust, Assembly (ARM), Python, Bash"),
            ("Embedded Platforms", "ARM Cortex-M0/M4/M7, STM32, ESP32, Nordic nRF52, Raspberry Pi, FreeRTOS, Zephyr RTOS"),
            ("Hardware Protocols", "I2C, SPI, UART, CAN Bus, BLE (Bluetooth Low Energy), MQTT, Zigbee, USB"),
            ("Lab &amp; Diagnostics", "Oscilloscopes, Logic Analyzers, JTAG/SWD Debugging, Wireshark, KiCad, Git"),
        ],
        "experience": [
            {
                "role": "Senior Firmware Engineer",
                "company": "Apex Sensor Systems",
                "dates": "2021 – Present",
                "bullets": [
                    "Architected ultra-low-power FreeRTOS firmware on STM32 microcontrollers extending remote sensor battery life to 3.5 years.",
                    "Engineered robust over-the-air (OTA) firmware upgrade protocol with dual-bank flash rollback protection and cryptographic checks.",
                    "Reduced sensor boot time from 850ms to 95ms through memory-mapped peripheral initialization and clock tree tuning.",
                ],
            },
            {
                "role": "Embedded Software Developer",
                "company": "InnoDrive Automotive",
                "dates": "2018 – 2021",
                "bullets": [
                    "Developed CAN bus telemetry communication layer meeting ISO 26262 functional safety ASIL-B requirements.",
                    "Designed hardware-in-the-loop (HIL) automated test harness in Python running 200+ unit test scenarios on each build.",
                ],
            },
        ],
        "projects": [
            {
                "name": "Zephyr BLE Sensor Hub",
                "tech": "C, Zephyr RTOS, Nordic nRF52840, BLE GATT",
                "bullets": [
                    "Built multi-sensor gateway gathering environmental telemetry and transmitting to mobile companion app via BLE.",
                ],
            },
            {
                "name": "LogicProbe Digital Protocol Analyzer",
                "tech": "C++, Python, Raspberry Pi Pico",
                "bullets": [
                    "Developed 8-channel open-source logic analyzer capable of capturing 24MHz digital signals with Sigrok support.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Electrical &amp; Computer Engineering",
            "school": "University of Michigan",
            "dates": "2014 – 2018",
            "details": "Eta Kappa Nu Electrical Engineering Honor Society. Embedded Systems Laboratory Researcher.",
        },
    },

    # 12. Chloe Dubois - Technical Product Manager
    {
        "filename": "Chloe_Dubois_Resume.pdf",
        "name": "Chloe Dubois",
        "title": "Technical Product Manager &amp; SaaS Platform Strategist",
        "contact": "<b>Email:</b> chloe.dubois@saaspm.io &nbsp;|&nbsp; <b>Phone:</b> +1 (303) 912-4480 &nbsp;|&nbsp; <b>Location:</b> Denver, CO &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/chloe-dubois-pm",
        "summary": "Technical Product Manager with 6+ years driving product strategy, developer API ecosystems, and agile roadmaps from conception through $10M+ ARR scaling. Expert at translating complex machine learning and cloud infrastructure architectures into compelling user outcomes.",
        "skills": [
            ("Product Strategy", "Product Roadmapping, PRD Authoring, User Story Mapping, OKR Alignment, Customer Discovery"),
            ("Technical Fluency", "SQL (PostgreSQL), RESTful API Design, JSON Specs, System Architecture Comprehension, Git"),
            ("Analytics &amp; Metrics", "Mixpanel, Amplitude, Google Analytics, PostHog, Tableau, JIRA, Confluence, Linear"),
            ("Methodologies", "Agile, Scrum, Kanban, Continuous Discovery, Design Sprints, Competitive Intelligence"),
        ],
        "experience": [
            {
                "role": "Lead Technical Product Manager",
                "company": "Synthetix Developer Tools",
                "dates": "2021 – Present",
                "bullets": [
                    "Spearheaded product vision and technical delivery for developer API platform, scaling active API developers from 8,000 to 75,000.",
                    "Authored 35+ comprehensive Product Requirement Documents (PRDs) collaborating closely with 4 engineering squads.",
                    "Improved developer onboarding self-serve activation rate by 38% through redesigned interactive documentation and sandbox APIs.",
                ],
            },
            {
                "role": "Product Manager",
                "company": "CloudWave Enterprise",
                "dates": "2019 – 2021",
                "bullets": [
                    "Led cross-functional team of 9 engineers and designers launching enterprise compliance dashboard adopted by 240+ clients.",
                    "Executed regular customer interviews and telemetry analysis to prioritize high-impact feature backlogs.",
                ],
            },
        ],
        "projects": [
            {
                "name": "DevPortal Self-Serve Sandbox",
                "tech": "Postman, OpenAPI Specs, React, Mixpanel",
                "bullets": [
                    "Launched interactive browser API explorer reducing developer support ticket volume by 42% in first quarter.",
                ],
            },
        ],
        "education": {
            "degree": "B.A. in Economics &amp; Computer Science",
            "school": "University of Colorado Boulder",
            "dates": "2015 – 2019",
            "details": "Summa Cum Laude. Certificate in Technology Entrepreneurship.",
        },
        "certifications": "Certified Scrum Product Owner (CSPO) &nbsp;|&nbsp; Pragmatic Institute Certified (PMC-III)",
    },

    # 13. Vikram Malhotra - Blockchain / Smart Contracts
    {
        "filename": "Vikram_Malhotra_Resume.pdf",
        "name": "Vikram Malhotra",
        "title": "Senior Blockchain &amp; Smart Contracts Protocol Engineer",
        "contact": "<b>Email:</b> vikram.m@web3forge.io &nbsp;|&nbsp; <b>Phone:</b> +1 (917) 502-3390 &nbsp;|&nbsp; <b>Location:</b> New York, NY &nbsp;|&nbsp; <b>GitHub:</b> github.com/vikram-web3",
        "summary": "Blockchain and Smart Contract Engineer with 5+ years writing secure decentralized protocols, gas-optimized Solidity contracts, and robust Web3 dApps. Thorough understanding of EVM internals, DeFi lending mechanisms, cross-chain bridges, and formal smart contract auditing.",
        "skills": [
            ("Smart Contracts", "Solidity, Vyper, Rust, Yul, EVM Architecture, Gas Optimization, Reentrancy Guards"),
            ("Development Tooling", "Hardhat, Foundry, Slither, Echidna, Mythril, OpenZeppelin Contracts, Tenderly"),
            ("Web3 &amp; Frontend", "Ethers.js, Viem, Wagmi, TypeScript, React, Next.js, IPFS, The Graph (Subgraphs)"),
            ("Protocols &amp; Chains", "Ethereum, Arbitrum, Polygon, Optimism, Solana, ERC-20, ERC-721, ERC-1155, DeFi AMMs"),
        ],
        "experience": [
            {
                "role": "Lead Smart Contract Engineer",
                "company": "Aetheria DeFi Protocols",
                "dates": "2022 – Present",
                "bullets": [
                    "Architected non-custodial decentralized lending protocol managing $45M in Total Value Locked (TVL) with zero security breaches.",
                    "Optimized Solidity smart contracts using custom assembly (Yul), achieving a 26% gas savings across all swap transactions.",
                    "Coordinated audits with top tier security firms (OpenZeppelin, Trail of Bits), resolving all critical and medium findings.",
                ],
            },
            {
                "role": "Web3 Software Developer",
                "company": "Genesis Block Labs",
                "dates": "2020 – 2022",
                "bullets": [
                    "Created custom ERC-721A smart contract collection minting 10,000 NFTs with gas-minimized batching algorithms.",
                    "Built custom Subgraph indexing blockchain event logs to serve real-time trading metrics to web frontends.",
                ],
            },
        ],
        "projects": [
            {
                "name": "FlashLoan Arbitrage Guard",
                "tech": "Solidity, Foundry, Ethers.js, Hardhat",
                "bullets": [
                    "Engineered flash-loan simulation test harness in Foundry validating protocol resistance against price oracle manipulation.",
                ],
            },
            {
                "name": "MultiSig Governance Vault",
                "tech": "Solidity, OpenZeppelin, React, TypeScript",
                "bullets": [
                    "Developed timelock-governed multi-signature treasury wallet for decentralized autonomous organization (DAO) management.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Science",
            "school": "Columbia University",
            "dates": "2016 – 2020",
            "details": "President of Columbia Blockchain Alliance. Published research on Decentralized Consensus.",
        },
    },

    # 14. Hannah Schmidt - UI/UX Design Technologist
    {
        "filename": "Hannah_Schmidt_Resume.pdf",
        "name": "Hannah Schmidt",
        "title": "Senior UI/UX Design Technologist &amp; Design Systems Lead",
        "contact": "<b>Email:</b> hannah.schmidt@uxdesign.de &nbsp;|&nbsp; <b>Phone:</b> +1 (503) 441-2890 &nbsp;|&nbsp; <b>Location:</b> Portland, OR &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/hannah-schmidt-design",
        "summary": "Design Technologist bridging the gap between product design and engineering. 6+ years designing accessible, tokenized design systems, interactive prototypes, and frictionless user journeys. Expert in Figma, React, TypeScript, Tailwind CSS, and WCAG accessibility standards.",
        "skills": [
            ("Design &amp; Prototyping", "Figma, FigJam, Adobe Creative Suite, Design Tokens, Wireframing, User Journey Mapping"),
            ("Frontend Engineering", "TypeScript, React, HTML5, CSS3, Tailwind CSS, Storybook, Radix UI, Framer Motion"),
            ("UX Methodologies", "Usability Testing, Heuristic Evaluation, Information Architecture, WCAG 2.1 AA Accessibility"),
            ("Collaboration Tools", "Zeroheight, GitHub, Linear, JIRA, UserTesting.com, Maze, Hotjar"),
        ],
        "experience": [
            {
                "role": "Lead Design Technologist",
                "company": "Kallos Design Systems",
                "dates": "2021 – Present",
                "bullets": [
                    "Created enterprise design token pipeline synchronizing Figma variables directly to Tailwind CSS and React components.",
                    "Conducted 50+ moderated user usability sessions, translating behavioral friction into quantifiable design improvements.",
                    "Architected unified dark and light mode themes ensuring harmonious contrast ratios exceeding WCAG AAA standards.",
                ],
            },
            {
                "role": "UI/UX Engineer",
                "company": "Aura Digital Studio",
                "dates": "2018 – 2021",
                "bullets": [
                    "Designed and coded responsive web interfaces for 12 enterprise SaaS applications, boosting task completion speed by 30%.",
                    "Maintained interactive component documentation in Storybook ensuring 100% parity between Figma files and production code.",
                ],
            },
        ],
        "projects": [
            {
                "name": "TokenBridge Figma Plugin",
                "tech": "TypeScript, Figma Plugin API, Tailwind CSS",
                "bullets": [
                    "Built plugin exporting design variables as CSS custom properties and JSON tokens used by 2,500+ design teams.",
                ],
            },
            {
                "name": "Accessible Form Kit",
                "tech": "React, TypeScript, Radix UI, Tailwind CSS",
                "bullets": [
                    "Developed accessible form library with built-in ARIA validation announcements and focus trap management.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Human-Centered Design &amp; Engineering",
            "school": "University of Washington",
            "dates": "2014 – 2018",
            "details": "Honors in Human-Computer Interaction and Ergonomic Computing.",
        },
    },

    # 15. Ryan Kowalski - QA / SDET
    {
        "filename": "Ryan_Kowalski_Resume.pdf",
        "name": "Ryan Kowalski",
        "title": "Lead QA Automation Engineer &amp; SDET",
        "contact": "<b>Email:</b> ryan.kowalski@qualityops.io &nbsp;|&nbsp; <b>Phone:</b> +1 (612) 349-8012 &nbsp;|&nbsp; <b>Location:</b> Minneapolis, MN &nbsp;|&nbsp; <b>GitHub:</b> github.com/ryan-sdet",
        "summary": "Software Development Engineer in Test (SDET) with 7+ years architecting enterprise test automation frameworks, continuous integration verification, and performance stress testing. Specialist in Playwright, Cypress, Python, TypeScript, Postman, and k6 load testing.",
        "skills": [
            ("Test Automation", "Playwright, Cypress, Selenium WebDriver, Appium, Cucumber (BDD), RestAssured"),
            ("Languages", "Python (Pytest), TypeScript, JavaScript, Java, Bash, SQL"),
            ("API &amp; Performance Testing", "Postman, k6, JMeter, Locust, Swagger / OpenAPI Test Generation"),
            ("CI/CD &amp; Infrastructure", "GitHub Actions, GitLab CI, Jenkins, Docker, BrowserStack, Allure Reporting"),
        ],
        "experience": [
            {
                "role": "Lead SDET",
                "company": "Veritas Quality Engineering",
                "dates": "2021 – Present",
                "bullets": [
                    "Architected unified end-to-end test framework in TypeScript and Playwright running 1,800+ test specs in parallel on GitHub Actions.",
                    "Slashed continuous integration regression test suite execution time from 75 minutes to 9 minutes through intelligent test sharding.",
                    "Engineered automated k6 load testing suite simulating 15,000 virtual users to catch latency regressions before production deployments.",
                ],
            },
            {
                "role": "QA Automation Engineer",
                "company": "Northstar Software",
                "dates": "2018 – 2021",
                "bullets": [
                    "Implemented comprehensive REST API regression automation suite in Python and Pytest with 98% coverage across 85 endpoints.",
                    "Reduced escape defects into production by 44% through mandatory pre-merge pull request test gates.",
                ],
            },
        ],
        "projects": [
            {
                "name": "Playwright Parallel Test Runner",
                "tech": "TypeScript, Playwright, Docker, GitHub Actions",
                "bullets": [
                    "Constructed containerized test runner with automated screenshot capturing and video recording on failure.",
                ],
            },
            {
                "name": "MockServer Dynamic API Simulator",
                "tech": "Python, FastAPI, Docker",
                "bullets": [
                    "Developed mock API service for testing edge cases, slow network latency, and HTTP 500 error handling.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Software Engineering",
            "school": "University of Minnesota",
            "dates": "2014 – 2018",
            "details": "Specialization in Software Verification, Testing, and Quality Assurance.",
        },
        "certifications": "ISTQB Certified Tester – Advanced Level Test Automation Engineer",
    },

    # 16. Fatima Zahra - Computer Vision / Robotics
    {
        "filename": "Fatima_Zahra_Resume.pdf",
        "name": "Fatima Zahra",
        "title": "Computer Vision &amp; Deep Learning Research Engineer",
        "contact": "<b>Email:</b> fatima.zahra@visionai.io &nbsp;|&nbsp; <b>Phone:</b> +1 (858) 490-2211 &nbsp;|&nbsp; <b>Location:</b> San Diego, CA &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/fatima-vision",
        "summary": "Computer Vision Engineer with 5+ years developing real-time object detection, 3D point cloud segmentation, and edge AI acceleration for autonomous robotics. Expert in PyTorch, OpenCV, C++, CUDA, YOLO architectures, and ROS2 frameworks.",
        "skills": [
            ("Vision &amp; Deep Learning", "OpenCV, PyTorch, TensorFlow, YOLOv8/v9, Mask R-CNN, 3D Point Cloud Library (PCL), NeRF"),
            ("Languages &amp; CUDA", "Python, C++ (C++17), CUDA, TensorRT, Bash, CMake"),
            ("Robotics &amp; Frameworks", "ROS / ROS2, Gazebo, LiDAR Processing, SLAM Algorithms, Depth Cameras (RealSense)"),
            ("Edge Deployment", "NVIDIA Jetson (Orin/Nano), ONNX Runtime, Docker, Linux, Git"),
        ],
        "experience": [
            {
                "role": "Computer Vision Engineer",
                "company": "Apex Robotics &amp; Autonomy",
                "dates": "2021 – Present",
                "bullets": [
                    "Engineered real-time multi-camera obstacle detection pipeline in C++ and TensorRT running at 45fps on NVIDIA Jetson AGX Orin.",
                    "Trained custom vision transformer models for defect detection in manufacturing assembly, lifting accuracy to 98.6%.",
                    "Integrated LiDAR and depth camera sensor fusion algorithm for precise indoor spatial mapping and SLAM navigation.",
                ],
            },
            {
                "role": "Research Engineer",
                "company": "Visual Intelligence Labs",
                "dates": "2019 – 2021",
                "bullets": [
                    "Developed automated video segmentation algorithms processing 4K surveillance video streams with sub-30ms latency.",
                    "Published research paper on synthetic data generation using domain randomization for training robust vision models.",
                ],
            },
        ],
        "projects": [
            {
                "name": "EdgeTrack Multi-Object Tracker",
                "tech": "C++, OpenCV, TensorRT, DeepSORT, YOLOv8",
                "bullets": [
                    "Constructed high-speed multi-object tracking pipeline running on edge hardware with ID retention accuracy &gt; 92%.",
                ],
            },
        ],
        "education": {
            "degree": "M.S. in Electrical &amp; Computer Engineering",
            "school": "University of California, San Diego (UCSD)",
            "dates": "2017 – 2019",
            "details": "Specialization in Computer Vision, Machine Learning, and Robotics Navigation.",
        },
    },

    # 17. Lucas Silva - Database Administrator
    {
        "filename": "Lucas_Silva_Resume.pdf",
        "name": "Lucas Silva",
        "title": "Principal Database Administrator &amp; Data Architect",
        "contact": "<b>Email:</b> lucas.silva@dbarchitect.net &nbsp;|&nbsp; <b>Phone:</b> +1 (415) 321-7789 &nbsp;|&nbsp; <b>Location:</b> San Francisco, CA &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/lucas-silva-dba",
        "summary": "Database Administrator and Systems Architect with 8+ years optimizing high-concurrency relational and NoSQL storage engines. Deep authority in PostgreSQL, MySQL, CockroachDB, query execution plan tuning, multi-master replication, and zero-downtime maintenance.",
        "skills": [
            ("RDBMS &amp; NoSQL", "PostgreSQL (12-16), MySQL, CockroachDB, MongoDB, Redis, Cassandra, DynamoDB"),
            ("Database Internals", "Query Optimization (EXPLAIN ANALYZE), B-Tree Indexing, VACUUM Internals, Connection Pooling (PgBouncer)"),
            ("Replication &amp; HA", "Streaming Replication, Logical Replication, Patroni, WAL Archiving, Point-In-Time Recovery (PITR)"),
            ("Infrastructure &amp; Tools", "Linux Kernel Tuning, Terraform, AWS RDS/Aurora, Prometheus pg_stat_statements, Python, Bash"),
        ],
        "experience": [
            {
                "role": "Principal Database Administrator",
                "company": "VastScale Infrastructure",
                "dates": "2020 – Present",
                "bullets": [
                    "Managed 65 production PostgreSQL clusters storing 120TB+ of mission-critical data with 99.999% availability.",
                    "Eliminated database CPU bottleneck during peak flash sales by refactoring query indexing, cutting average lock wait time by 75%.",
                    "Orchestrated zero-downtime major version upgrade from PostgreSQL 12 to 16 using logical replication across 15,000 tables.",
                ],
            },
            {
                "role": "Senior Database Engineer",
                "company": "TerraData Networks",
                "dates": "2017 – 2020",
                "bullets": [
                    "Configured automated failover clustering using Patroni, etcd, and HAProxy, achieving automated failovers in &lt; 12 seconds.",
                    "Automated automated daily backup verification and restore simulations via pgBackRest, guaranteeing zero-data-loss compliance.",
                ],
            },
        ],
        "projects": [
            {
                "name": "PgSlowQuery Telemetry Agent",
                "tech": "Go, PostgreSQL pg_stat_statements, Grafana",
                "bullets": [
                    "Engineered daemon aggregating slow database queries in real-time and correlating with client application trace IDs.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Engineering",
            "school": "Georgia Institute of Technology",
            "dates": "2013 – 2017",
            "details": "Focus on Storage Systems, Distributed Databases, and File System Architecture.",
        },
    },

    # 18. Emily Zhang - Golang High-Throughput Microservices
    {
        "filename": "Emily_Zhang_Resume.pdf",
        "name": "Emily Zhang",
        "title": "Senior Golang Microservices &amp; Systems Engineer",
        "contact": "<b>Email:</b> emily.zhang@godev.io &nbsp;|&nbsp; <b>Phone:</b> +1 (206) 882-1920 &nbsp;|&nbsp; <b>Location:</b> Seattle, WA &nbsp;|&nbsp; <b>GitHub:</b> github.com/emilyzhang-go",
        "summary": "Systems Software Engineer with 6+ years building ultra-high-throughput, low-latency microservices in Go. Expert in concurrent programming with goroutines, gRPC/Protobuf protocols, distributed tracing, and real-time financial data streaming.",
        "skills": [
            ("Languages", "Go (Golang), C, Python, SQL, Protocol Buffers, Bash"),
            ("Distributed Backend", "gRPC, REST, NATS, Kafka, RabbitMQ, WebSockets, Concurrency Primitives, Memory Profiling (pprof)"),
            ("Storage &amp; Cache", "PostgreSQL, Redis, BadgDB, BoltDB, MinIO"),
            ("Cloud &amp; Monitoring", "Docker, Kubernetes, AWS, Prometheus, Jaeger, OpenTelemetry, Grafana, Linux"),
        ],
        "experience": [
            {
                "role": "Senior Go Engineer",
                "company": "Aura Stream Systems",
                "dates": "2021 – Present",
                "bullets": [
                    "Engineered Go microservices processing 120,000+ financial market events per second with sub-5ms p99 latency.",
                    "Reduced microservice memory allocation by 40% through deep heap analysis with pprof and sync.Pool buffer recycling.",
                    "Constructed gRPC inter-service communication mesh replacing legacy REST calls, reducing network payload sizes by 65%.",
                ],
            },
            {
                "role": "Software Developer",
                "company": "Krypton Web Services",
                "dates": "2018 – 2021",
                "bullets": [
                    "Developed distributed rate-limiting gateway in Go and Redis handling 50,000 API requests/minute across multi-tenant clients.",
                    "Configured end-to-end benchmark testing suites measuring goroutine contention and memory leak prevention.",
                ],
            },
        ],
        "projects": [
            {
                "name": "FastCache In-Memory Key-Value Store",
                "tech": "Go (Golang), Sharded Locks, LRU Eviction",
                "bullets": [
                    "Built concurrent zero-allocation in-memory cache achieving 15M ops/second on standard 8-core hardware.",
                ],
            },
            {
                "name": "ProtoValidator Codegen Tool",
                "tech": "Go, Protocol Buffers Plugin API, AST",
                "bullets": [
                    "Created protoc compiler plugin generating automated type validation logic directly from protobuf definitions.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Science",
            "school": "University of Waterloo",
            "dates": "2014 – 2018",
            "details": "Graduated with Distinction. Algorithms &amp; Concurrent Systems Concentration.",
        },
    },

    # 19. Tarik Benali - IT Infrastructure & Network Engineer
    {
        "filename": "Tarik_Benali_Resume.pdf",
        "name": "Tarik Benali",
        "title": "Senior IT Systems &amp; Network Infrastructure Administrator",
        "contact": "<b>Email:</b> tarik.benali@itops.org &nbsp;|&nbsp; <b>Phone:</b> +1 (312) 770-4491 &nbsp;|&nbsp; <b>Location:</b> Chicago, IL &nbsp;|&nbsp; <b>LinkedIn:</b> linkedin.com/in/tarik-benali",
        "summary": "IT Infrastructure and Network Administrator with 7+ years managing enterprise server fleets, hybrid cloud integrations, and secure network perimeters. Expert in Linux/Windows system administration, Cisco networking, Active Directory, virtualization, and automated patching.",
        "skills": [
            ("Operating Systems", "Linux (RHEL, Ubuntu, Rocky Linux), Windows Server (2016-2022), VMware vSphere, Proxmox"),
            ("Networking &amp; Security", "Cisco Routing &amp; Switching, VLANs, BGP, OSPF, Firewalls (Palo Alto, Fortinet), VPN, DNS, DHCP"),
            ("Directory &amp; Identity", "Active Directory, Azure AD / Entra ID, LDAP, Single Sign-On (SAML/OIDC), Group Policy (GPO)"),
            ("Automation &amp; Scripting", "Bash, PowerShell, Ansible, Python, NGINX, HAProxy, Zabbix Monitoring"),
        ],
        "experience": [
            {
                "role": "Senior Systems Administrator",
                "company": "Midwest Health Systems",
                "dates": "2020 – Present",
                "bullets": [
                    "Administered 350+ virtualized server instances on VMware vSphere hosting critical hospital management software with 99.98% uptime.",
                    "Automated operating system security patching across 600 Linux and Windows endpoints using Ansible, eliminating 90% of manual effort.",
                    "Re-architected enterprise network topology with redundant Cisco Core switches and Palo Alto next-generation firewalls.",
                ],
            },
            {
                "role": "Network Administrator",
                "company": "Nexus Corporate Networks",
                "dates": "2017 – 2020",
                "bullets": [
                    "Configured site-to-site IPsec VPN tunnels connecting 8 regional offices with centralized Active Directory authentication.",
                    "Implemented Zabbix SNMP network monitoring notifying operations teams of interface packet drops before outages occurred.",
                ],
            },
        ],
        "projects": [
            {
                "name": "Ansible Fleet Provisioner",
                "tech": "Ansible, Bash, Linux, Git",
                "bullets": [
                    "Developed playbook library provisioning standard hardened server images with CIS security benchmarks in under 8 minutes.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Information Technology &amp; Network Security",
            "school": "Illinois Institute of Technology",
            "dates": "2013 – 2017",
            "details": "Cisco Networking Academy Graduate. Student Network Operations Center Lead.",
        },
        "certifications": "Cisco Certified Network Associate (CCNA) &nbsp;|&nbsp; Red Hat Certified System Administrator (RHCSA)",
    },

    # 20. Zoe Mitchell - Junior Full Stack Web Developer
    {
        "filename": "Zoe_Mitchell_Resume.pdf",
        "name": "Zoe Mitchell",
        "title": "Junior Full-Stack Web Developer",
        "contact": "<b>Email:</b> zoe.mitchell@webdev.io &nbsp;|&nbsp; <b>Phone:</b> +1 (602) 441-9920 &nbsp;|&nbsp; <b>Location:</b> Phoenix, AZ &nbsp;|&nbsp; <b>GitHub:</b> github.com/zoe-mitchell",
        "summary": "Energetic and fast-learning Junior Full-Stack Developer with hands-on experience building modern, responsive web applications using React, JavaScript, Node.js, Express, and MongoDB. Strong collaborator passionate about clean code, REST APIs, and delightful user interfaces.",
        "skills": [
            ("Frontend", "JavaScript (ES6+), React, HTML5, CSS3, Tailwind CSS, Responsive Design, Bootstrap"),
            ("Backend", "Node.js, Express, RESTful APIs, JWT Authentication, JSON, Postman"),
            ("Databases", "MongoDB, Mongoose ORM, PostgreSQL, SQLite, Firebase"),
            ("Tools &amp; Version Control", "Git, GitHub, VS Code, npm, Webpack, Vercel, Netlify"),
        ],
        "experience": [
            {
                "role": "Junior Full-Stack Developer",
                "company": "Apex Web Solutions",
                "dates": "2023 – Present",
                "bullets": [
                    "Built 12 responsive marketing landing pages and user onboarding forms using React and Tailwind CSS.",
                    "Created RESTful endpoints in Node.js and Express to handle user account registration, authentication, and password resets.",
                    "Collaborated in weekly agile sprints, participating in daily standups, code reviews, and pair programming sessions.",
                ],
            },
            {
                "role": "Web Development Intern",
                "company": "Southwest Digital Agency",
                "dates": "2022 – 2023",
                "bullets": [
                    "Assisted senior engineers in refactoring legacy CSS to Tailwind CSS, improving mobile responsiveness across 4 client sites.",
                    "Wrote automated unit test scripts using Jest verifying utility functions and React component rendering.",
                ],
            },
        ],
        "projects": [
            {
                "name": "TaskFlow Productivity App",
                "tech": "React, Node.js, Express, MongoDB, Tailwind CSS",
                "bullets": [
                    "Developed full-stack Kanban board web application with drag-and-drop task management and real-time status updates.",
                ],
            },
            {
                "name": "DevRecipes Recipe Sharing Hub",
                "tech": "React, Firebase Authentication, Cloud Firestore",
                "bullets": [
                    "Built recipe sharing platform allowing registered users to post, bookmark, and rate culinary recipes.",
                ],
            },
        ],
        "education": {
            "degree": "B.S. in Computer Information Systems",
            "school": "Arizona State University",
            "dates": "2019 – 2023",
            "details": "GPA 3.7/4.0. Relevant Coursework: Web Programming, Database Concepts, Software Testing, UI Design.",
        },
    },
]

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Generating 20 unique PDF resumes in: {current_dir}\n")
    
    generated_files = []
    for idx, candidate in enumerate(RESUMES_DATA, start=1):
        target_path = os.path.join(current_dir, candidate["filename"])
        create_resume_pdf(candidate, target_path)
        generated_files.append(target_path)
        
    print(f"\n[SUCCESS] Successfully generated all {len(generated_files)} PDF resumes!")
    for f in generated_files:
        print(f"  - {os.path.basename(f)} ({os.path.getsize(f):,} bytes)")

if __name__ == "__main__":
    main()
