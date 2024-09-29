"use client";
import { useState } from "react";

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [cid, setCid] = useState<string>(""); // State to store the CID

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle form submit for file upload
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Upload file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setFileUrl(data.url || "Error uploading file");

      // After uploading, fetch the CID from the queue
      const cidResponse = await fetch("/api/queue"); // Fetch CID
      const cidData = await cidResponse.json();
      console.log(cidData)
      const hfverify = await fetch("https://hfvalidation-api.vercel.app/check_model?repo_id=DEEPAK70681/sendIntentModelTHEOGv1");

      if (hfverify.ok) {
        const result = await hfverify.json(); // Parse the response as JSON
        console.log("Result:", result); // Log the actual data
      } else {
        console.error("Failed to fetch:", hfverify.status, hfverify.statusText);
      }
      
      

      if (cidResponse.ok) {
        setCid(cidData.cid || "No CID found");
      } else {
        setCid("Error fetching CID");
      }
      
    } catch (error) {
      console.error("Error during file upload or CID fetch", error);
      setFileUrl("Error uploading file");
      setCid("Error fetching CID");
    }

  };


  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".py" onChange={handleFileChange} required />
        <button type="submit">Upload</button>
      </form>

      {/* Display the uploaded file URL */}
      {fileUrl && (
        <p>
          Uploaded File URL:{" "}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileUrl}
          </a>
        </p>
      )}

      {/* Display the CID fetched from the queue */}
      {cid && <p>First CID in the queue: {cid}</p>}
    </div>
  );
};

export default UploadForm;
