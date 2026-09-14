from typing import List, Dict, Any

def generate_recommendations(
    resume_skills: List[Dict[str, Any]],
    missing_skills: List[Dict[str, Any]],
    ats_data: Dict[str, Any],
    job_title: str = "Target Role"
) -> List[Dict[str, Any]]:
    """Generate targeted resume optimization recommendations based on candidate skill gaps and ATS categories."""
    recommendations: List[Dict[str, Any]] = []
    rec_id = 1

    # 1. Skill Gap Recommendations
    for missing in missing_skills[:3]:
        skill_name = missing["name"]
        prio = missing.get("priority", "high")
        effort = "2–4 weeks" if prio == "high" else "1–2 weeks"
        impact = "+6 to +8 match score points" if prio == "high" else "+3 to +5 match score points"
        
        resources = [
            f"Official {skill_name} documentation and tutorials",
            f"Build a hands-on project incorporating {skill_name}",
            f"Deploy or showcase a {skill_name} integration in your GitHub portfolio",
        ]

        recommendations.append({
            "id": rec_id,
            "type": "skill-gap",
            "priority": prio,
            "title": f"Add {skill_name} experience",
            "description": f"{skill_name} is required by the target {job_title} role but is not clearly demonstrated in your resume. If you have experience with {skill_name}, make it prominent. Otherwise, build a hands-on project.",
            "reason": f"{skill_name} is listed as a primary requirement and distinguishes competitive candidates.",
            "effort": effort,
            "impact": impact,
            "resources": resources,
        })
        rec_id += 1

    # 2. Content & Impact Recommendations
    if ats_data.get("breakdown", [{}])[-1].get("score", 100) < 80:
        recommendations.append({
            "id": rec_id,
            "type": "content",
            "priority": "medium",
            "title": "Quantify project outcomes with verified metrics",
            "description": "Include verifiable engineering impact metrics (e.g., % latency reduction, daily transactions processed, active users) where you have factual data.",
            "reason": "Quantified achievements increase ATS keyword density and signal strong engineering ownership to reviewers.",
            "effort": "30 minutes",
            "impact": "+4 ATS score points",
            "resources": ["Review your existing projects for performance benchmarks or usage numbers"],
        })
        rec_id += 1

    # 3. Structure & Summary Recommendation
    recommendations.append({
        "id": rec_id,
        "type": "structure",
        "priority": "medium",
        "title": "Add or polish professional summary",
        "description": "A 2–3 sentence professional summary immediately after your contact details helps ATS systems classify your role and gives recruiters immediate context.",
        "reason": "Professional summaries improve keyword density and assist fast candidate screening.",
        "effort": "20 minutes",
        "impact": "+3 ATS score points",
        "resources": ["Write a concise summary highlighting your primary tech stack and career focus"],
    })

    return recommendations

def generate_skill_roadmap(missing_skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generates a progressive 4-month learning roadmap for missing skills."""
    missing_names = [m["name"] for m in missing_skills]
    
    # Defaults if missing skills are few
    pool = missing_names + ["Docker", "Kubernetes", "AWS Cloud", "CI/CD & Testing", "System Design", "Terraform"]
    pool = list(dict.fromkeys(pool))  # Remove duplicates

    m1 = pool[0] if len(pool) > 0 else "Backend Mastery"
    m2 = pool[1] if len(pool) > 1 else "Cloud Architecture"
    m3 = pool[2] if len(pool) > 2 else "Container Orchestration"
    m4 = pool[3] if len(pool) > 3 else "Infrastructure as Code"

    return [
        {
            "month": "Month 1",
            "focus": f"{m1} Foundations",
            "skills": [f"{m1} Core Concepts", f"{m1} Hands-on Labs", "Project Integration"],
            "status": "in-progress",
        },
        {
            "month": "Month 2",
            "focus": f"{m2} Implementation",
            "skills": [f"{m2} Architecture", "Production Configuration", "Security Best Practices"],
            "status": "upcoming",
        },
        {
            "month": "Month 3",
            "focus": f"{m3} Deep Dive",
            "skills": [f"{m3} Deployment", "Cluster / Service Management", "Observability"],
            "status": "upcoming",
        },
        {
            "month": "Month 4",
            "focus": f"{m4} & Career Portfolio",
            "skills": [f"{m4} Workflows", "End-to-end Portfolio Project", "Interview Preparation"],
            "status": "upcoming",
        },
    ]

def improve_resume_bullet(original_bullet: str) -> Dict[str, str]:
    """Rewrite a bullet point to lead with an active verb and emphasize technical ownership."""
    cleaned = original_bullet.strip().lstrip("-*• ")
    if not cleaned:
        return {
            "original": "",
            "improved": "",
            "explanation": "Please provide a non-empty bullet point.",
        }

    # Action verb replacement mapping
    weak_verbs = {
        "worked on": "Engineered",
        "helped with": "Collaborated on",
        "made": "Developed",
        "did": "Executed",
        "built": "Architected and implemented",
        "created": "Engineered and deployed",
        "fixed": "Diagnosed and resolved",
    }

    improved = cleaned
    verb_replaced = False
    for weak, strong in weak_verbs.items():
        if improved.lower().startswith(weak):
            improved = strong + improved[len(weak):]
            verb_replaced = True
            break

    if not verb_replaced:
        # Prepend strong verb if missing
        if not any(improved.lower().startswith(v) for v in ["architected", "engineered", "developed", "spearheaded", "designed"]):
            improved = f"Engineered and delivered {improved[0].lower() + improved[1:]}"

    improved += " — enhancing component reliability and code maintainability."

    return {
        "original": original_bullet,
        "improved": improved,
        "explanation": "Strengthened action verb, clarified engineering ownership, and added architectural context. (Tip: Include a verified metric like '% latency improved' or 'team adoption' if you have factual evidence).",
    }
