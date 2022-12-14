import { useState } from "react";
import axios from "axios";
import { API_URL } from "../utils/constants";

const FileUpload = ({ setFilesList }) => {
  const [formState, setFormState] = useState({
    author: "",
    description: "",
    filename: "",
    selectedFile: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const acceptedFileFormats = [
    "image/png",
    "application/pdf",
    "application/xml",
    "text/xml",
    "image/jpeg",
  ];
  const handleInputChange = (event) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    setFormState({
      ...formState,
      selectedFile: event.target.files[0],
      filename: event.target.files[0].name,
    });
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();

    try {
      const { author, description, selectedFile, filename } = formState;
      if (author.trim() !== "" && description.trim() !== "") {
        if (selectedFile) {
          if (!acceptedFileFormats.includes(selectedFile.type)) {
            setErrorMessage(
              "only upload files with jpg, jpeg, pdf, png and xml format."
            );
            return;
          }

          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("filename", filename);
          formData.append("author", author);
          formData.append("description", description);

          setErrorMessage("");
          setIsLoading(true);
          const res = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          setFilesList((prevState) => [...prevState, res.data]);
          setFormState({
            author: "",
            description: "",
            filename: "",
            selectedFile: null,
          });
          window.location.reload();
        } else {
          setIsLoading(false);
          setErrorMessage("Please select a file to upload");
        }
      } else {
        setIsLoading(false);
        setErrorMessage("Please enter a author and a description");
      }
    } catch (error) {
      setIsLoading(false);
      error.response && setErrorMessage(error.response.data);
    }
  };

  return (
    <>
      <form className="box" onSubmit={handleOnSubmit}>
        {errorMessage && (
          <article className="message is-danger">
            <p className="message-body">{errorMessage}</p>
          </article>
        )}
        {isLoading && <div>Loading..</div>}
        <div className="field">
          <label className="label">Author</label>
          <div className="control">
            <input
              className="input"
              type="text"
              name="author"
              value={formState.author || ""}
              placeholder="Enter author"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Description</label>
          <div className="control">
            <input
              className="input"
              type="text"
              name="description"
              value={formState.description || ""}
              placeholder="Enter description"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="field">
          <div className="file is-boxed">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                name="selectedFile"
                onChange={handleFileChange}
              />
              <span className="file-cta">
                <span className="file-icon">
                  <i className="fas fa-upload"></i>
                </span>
                <span className="file-label">Choose a file</span>
              </span>
            </label>
          </div>
        </div>
        {formState.selectedFile && (
          <div className="field">
            <div className="control">
              <input
                className="input"
                type="text"
                name="filename"
                value={formState.filename || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}
        <button className="button is-link" type="submit">
          Upload
        </button>
      </form>
    </>
  );
};

export default FileUpload;
