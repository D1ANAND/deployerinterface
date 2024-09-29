"use client";
import { useState } from "react";

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setFileUrl(data.url || "Error uploading file");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".py" onChange={handleFileChange} required />
        <button type="submit">Upload</button>
      </form>
      {fileUrl && (
        <p>
          Uploaded File URL:{" "}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileUrl}
          </a>
        </p>
      )}
    </div>
  );
};

export default UploadForm;
