import re
from typing import Dict, List, Tuple, Set, Any

# Canonical Skill Dictionary grouped by category
SKILL_DICTIONARY: Dict[str, List[str]] = {
    "Programming": [
        "Python", "JavaScript", "TypeScript", "Java", "C", "C++", "C#", "Go", "Rust",
        "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "Dart", "Elixir", "Haskell",
        "Perl", "Shell", "Bash", "PowerShell", "MATLAB", "Objective-C", "Assembly", "Lua"
    ],
    "Frontend": [
        "React", "Angular", "Vue", "Next.js", "Nuxt.js", "Svelte", "HTML", "HTML5", "CSS", "CSS3",
        "Tailwind CSS", "Bootstrap", "Sass", "SCSS", "Less", "Redux", "Zustand", "Webpack",
        "Vite", "jQuery", "GraphQL", "REST API", "Responsive Design", "WebSockets", "D3.js",
        "Three.js", "Material UI", "Chakra UI", "Storybook"
    ],
    "Backend": [
        "Node.js", "FastAPI", "Django", "Flask", "Spring Boot", "Express.js", "NestJS",
        "Ruby on Rails", "ASP.NET", "Laravel", "Koa", "Gin", "Fiber", "Microservices",
        "gRPC", "RabbitMQ", "Kafka", "Celery", "Socket.io", "RESTful API", "GraphQL API"
    ],
    "Database": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Microsoft SQL Server",
        "Cassandra", "DynamoDB", "Elasticsearch", "Neo4j", "Firebase", "Supabase", "Prisma",
        "SQLAlchemy", "TypeORM", "Mongoose", "CouchDB", "InfluxDB", "SQL", "NoSQL"
    ],
    "Cloud": [
        "AWS", "Amazon Web Services", "Azure", "Microsoft Azure", "Google Cloud", "GCP",
        "DigitalOcean", "Heroku", "Vercel", "Netlify", "Cloudflare", "AWS Lambda", "EC2",
        "S3", "CloudFront", "IAM", "ECS", "EKS", "GKE", "BigQuery"
    ],
    "DevOps": [
        "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "GitLab CI", "CI/CD",
        "Terraform", "Ansible", "Helm", "Prometheus", "Grafana", "Nginx", "Apache",
        "Linux", "Ubuntu", "Debian", "CentOS", "ArgoCD", "Puppet", "Chef", "Vagrant"
    ],
    "AI/ML": [
        "Machine Learning", "Deep Learning", "Natural Language Processing", "NLP", "Computer Vision",
        "PyTorch", "TensorFlow", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV",
        "HuggingFace", "Transformers", "LLM", "Generative AI", "LangChain", "LlamaIndex",
        "Vector Databases", "pgvector", "ChromaDB", "Pinecone", "Qdrant", "spaCy", "NLTK"
    ],
    "Tools": [
        "Git", "GitHub", "GitLab", "Bitbucket", "Postman", "Jira", "Confluence", "Figma",
        "VS Code", "IntelliJ IDEA", "Docker Desktop", "npm", "yarn", "pnpm", "pip",
        "Maven", "Gradle", "Swagger", "Notion", "Slack", "Trello"
    ],
    "Soft Skills": [
        "Communication", "Problem Solving", "Team Collaboration", "Leadership", "Adaptability",
        "Time Management", "Critical Thinking", "Agile", "Scrum", "Mentoring", "Conflict Resolution",
        "Presentation Skills", "Project Management", "Decision Making"
    ]
}

# Skill Normalization Map: maps variants/aliases to canonical skill names
SKILL_NORMALIZATION: Dict[str, str] = {
    "reactjs": "React",
    "react.js": "React",
    "nextjs": "Next.js",
    "vuejs": "Vue",
    "vue.js": "Vue",
    "angularjs": "Angular",
    "nodejs": "Node.js",
    "node": "Node.js",
    "expressjs": "Express.js",
    "express": "Express.js",
    "fast-api": "FastAPI",
    "js": "JavaScript",
    "ts": "TypeScript",
    "py": "Python",
    "postgres": "PostgreSQL",
    "psql": "PostgreSQL",
    "mongo": "MongoDB",
    "mssql": "Microsoft SQL Server",
    "k8s": "Kubernetes",
    "amazon web services": "AWS",
    "google cloud platform": "Google Cloud",
    "gcp": "Google Cloud",
    "microsoft azure": "Azure",
    "docker compose": "Docker",
    "docker-compose": "Docker",
    "github action": "GitHub Actions",
    "gh actions": "GitHub Actions",
    "ci / cd": "CI/CD",
    "cicd": "CI/CD",
    "restful": "REST API",
    "rest apis": "REST API",
    "restful api": "REST API",
    "restful apis": "REST API",
    "machine-learning": "Machine Learning",
    "deep-learning": "Deep Learning",
    "sklearn": "Scikit-learn",
    "tf": "TensorFlow",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "golang": "Go",
    "git hub": "GitHub",
    "team player": "Team Collaboration",
    "collaboration": "Team Collaboration",
    "problem-solving": "Problem Solving",
}

def normalize_skill_name(raw_name: str) -> str:
    """Normalizes a raw skill name into its canonical equivalent."""
    clean = raw_name.strip()
    lowered = clean.lower()
    if lowered in SKILL_NORMALIZATION:
        return SKILL_NORMALIZATION[lowered]
    return clean

def extract_skills_from_text(text: str, experience_text: str = "", projects_text: str = "") -> List[Dict[str, Any]]:
    """
    Extracts canonical skills from text with categorization, frequency, and proficiency estimation.
    Proficiency is calculated using occurrence in context, experience bullets, and projects.
    """
    if not text:
        return []

    found_skills: Dict[str, Dict[str, Any]] = {}
    lower_text = text.lower()
    exp_lower = experience_text.lower()
    proj_lower = projects_text.lower()

    for category, skills in SKILL_DICTIONARY.items():
        for skill in skills:
            canonical = normalize_skill_name(skill)
            # Create regex with boundary matching
            # Special case for C, C++, C#, .NET, R
            if skill in ("C", "R"):
                pattern = r"(?:\b|\s)" + re.escape(skill) + r"(?:,|\s|\.|\))"
            elif skill in ("C++", "C#", ".NET"):
                pattern = re.escape(skill) + r"(?:\b|\s|,|\.|\))"
            else:
                pattern = r"\b" + re.escape(skill.lower()) + r"\b"

            matches = list(re.finditer(pattern, lower_text))
            if not matches:
                # Also check normalization aliases for this skill
                alias_matches = []
                for alias, target in SKILL_NORMALIZATION.items():
                    if target.lower() == canonical.lower():
                        a_pat = r"\b" + re.escape(alias) + r"\b"
                        alias_matches.extend(list(re.finditer(a_pat, lower_text)))
                matches = alias_matches

            if matches:
                count = len(matches)
                # Compute proficiency level (50 to 98)
                in_exp = bool(re.search(pattern, exp_lower))
                in_proj = bool(re.search(pattern, proj_lower))
                
                # Base score from frequency
                base_level = min(70 + (count * 4), 90)
                if in_exp:
                    base_level = min(base_level + 8, 98)
                if in_proj:
                    base_level = min(base_level + 5, 98)

                if canonical not in found_skills:
                    found_skills[canonical] = {
                        "name": canonical,
                        "category": category,
                        "frequency": count,
                        "level": base_level,
                        "in_experience": in_exp,
                        "in_projects": in_proj,
                        "confidence": 0.95 if count > 1 or in_exp else 0.85,
                    }
                else:
                    found_skills[canonical]["frequency"] += count

    # Return as list sorted by frequency/level
    result = list(found_skills.values())
    result.sort(key=lambda s: (s["level"], s["frequency"]), reverse=True)
    return result
