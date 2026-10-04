from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
import io

app = FastAPI(
    title="AI For Everyone - Resume Analyzer",
    description="AI-powered resume analysis API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "AI For Everyone Resume Analyzer API is running!"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/api/resume/analyze")
async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form("")
):
    if resume_file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF resume."
        )

    file_content = await resume_file.read()

    try:
        pdf = PdfReader(io.BytesIO(file_content))

        resume_text = ""

        for page in pdf.pages:
            text = page.extract_text()
            if text:
                resume_text += text + "\n"

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the PDF."
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the PDF."
        )

    skills = [
        "python",
        "java",
        "javascript",
        "react",
        "node",
        "mongodb",
        "sql",
        "git",
        "docker",
        "aws",
        "fastapi",
        "machine learning"
    ]

    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    skills_found = [
        skill for skill in skills
        if skill in resume_lower
    ]

    matched_skills = [
        skill for skill in skills
        if skill in resume_lower and skill in job_lower
    ]

    missing_skills = [
        skill for skill in skills
        if skill in job_lower and skill not in resume_lower
    ]

    score = min(100, 40 + len(skills_found) * 5)

    suggestions = [
        "Add measurable achievements to your experience.",
        "Use relevant keywords from the job description.",
        "Keep your resume concise and ATS-friendly."
    ]

    return {
        "score": score,
        "filename": resume_file.filename,
        "skills_found": skills_found,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions
    }