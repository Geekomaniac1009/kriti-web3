import { useState } from "react";
import "./Apply.css";

function CarbonCreditForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [carbonCredits, setCarbonCredits] = useState(100); // Initial credits

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setMessage("Only PDF files are allowed!");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("File size should be less than 5MB!");
      return;
    }

    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setCarbonCredits(carbonCredits + 10); // Increase by 10 credits
        setMessage("Upload successful! 10 Carbon Credits added.");
        setFile(null);
      } else {
        setMessage("Upload failed. Please try again.");
      }
    } catch (error) {
      setMessage("Error uploading file.");
    }
  };

  return (
    <div className="carbon-credit-form">
      <h2>Apply for Carbon Credits</h2>
      <p>Upload a document to verify your eligibility.</p>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {file && <p className="file-name">Selected: {file.name}</p>}

      <button onClick={handleUpload}>Upload PDF</button>
      <p className="message">{message}</p>

      <div className="balance">
        <h3>Current Carbon Credits: {carbonCredits}</h3>
      </div>
    </div>
  );
}

export default CarbonCreditForm;
