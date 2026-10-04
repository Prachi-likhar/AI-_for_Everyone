import { useState } from "react";

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeResume = async () => {
    if (!resumeFile) {
      setError("Please select a PDF resume.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resume_file", resumeFile);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/resume/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1>AI For Everyone</h1>
      <h2>📄 Resume Analyzer</h2>

      <p>
        Upload your resume and compare your skills with a job description.
      </p>

      <label>
        <strong>Upload Resume PDF</strong>
      </label>

      <br />
      <br />

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={(e) => {
          setResumeFile(e.target.files[0]);
          setError("");
          setResult(null);
        }}
      />

      {resumeFile && (
        <p>
          Selected file: <strong>{resumeFile.name}</strong>
        </p>
      )}

      <br />

      <label>
        <strong>Job Description (Optional)</strong>
      </label>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
        rows="8"
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <button onClick={analyzeResume} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Analysis Result</h2>

          <h3>ATS Score: {result.score}/100</h3>

          <p>
            <strong>File:</strong> {result.filename}
          </p>

          <h3>Skills Found</h3>
          <ul>
            {result.skills_found.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <h3>Matching Skills</h3>
          <ul>
            {result.matched_skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul>
            {result.missing_skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <h3>Suggestions</h3>
          <ul>
            {result.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;