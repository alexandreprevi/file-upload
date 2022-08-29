import FilesList from "./components/FilesList";
import Header from "./components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "./utils/constants";
import FileUpload from "./components/FileUpload";

const App = () => {
  const [filesList, setFilesList] = useState();

  const getFilesList = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/getAllFiles`);
      setFilesList(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFilesList();
  }, []);
  return (
    <>
      <Header title={"File Upload"} />
      <div className="container px-3">
        {filesList && (
          <>
            <FilesList data={filesList} itemsPerPage={5} startFrom={1} />
            <FileUpload setFilesList={setFilesList} />
          </>
        )}
      </div>
    </>
  );
};

export default App;
