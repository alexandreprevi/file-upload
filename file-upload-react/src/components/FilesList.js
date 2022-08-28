import { useState } from "react";
import download from "downloadjs";
import axios from "axios";
import moment from "moment";
import { API_URL } from "../utils/constants";
import usePagination from "../utils/usePagination";
import { AiOutlineFilePdf, AiOutlineFileJpg } from "react-icons/ai";
import { SiMxlinux } from "react-icons/si";

const FilesList = ({ data, itemsPerPage, startFrom }) => {
  const [filesList, setFilesList] = useState(data);
  const [errorMessage, setErrorMessage] = useState("");
  const [sortByKey, setSortByKey] = useState("createdAt");
  const [order, setOrder] = useState("asc");
  const columns = [
    { label: "", sortKey: "file_mimetype" },
    { label: "Filename", sortKey: "filename" },
    { label: "Description", sortKey: "description" },
    { label: "Uploaded by", sortKey: "author" },
    { label: "Date", sortKey: "createdAt" },
  ];
  const {
    slicedData,
    pagination,
    prevPage,
    nextPage,
    changePage,
    setFilteredData,
    filteredData,
  } = usePagination({ itemsPerPage, filesList, startFrom });

  const sortHandler = (sortBy, orderBy) => {
    if (sortByKey !== sortBy) setSortByKey(sortBy);
    if (order !== orderBy) setOrder(orderBy);

    const copyOfFilteredData = [...filteredData];
    const filtered = sortData(copyOfFilteredData, sortBy, orderBy);
    setFilteredData(filtered);
  };

  const sortData = (dataToSort, sortBy, orderBy) => {
    const filtered = dataToSort.sort((a, b) => {
      if (orderBy === "asc") {
        if (a[sortBy] < b[sortBy]) {
          return -1;
        } else if (a[sortBy] > b[sortBy]) {
          return 1;
        } else {
          return 0;
        }
      } else {
        if (b[sortBy] < a[sortBy]) {
          return -1;
        } else if (b[sortBy] > a[sortBy]) {
          return 1;
        } else {
          return 0;
        }
      }
    });
    return filtered;
  };

  const downloadFile = async (id, path, mimetype) => {
    try {
      const result = await axios.get(`${API_URL}/download/${id}`, {
        responseType: "blob",
      });

      const split = path.split("/");
      const filename = split[split.length - 1];
      setErrorMessage("");
      return download(result.data, filename, mimetype);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage("Error while downloading file. Try again later");
      }
    }
  };

  const deleteFile = async (id) => {
    try {
      await axios.delete(`${API_URL}/delete/${id}`).then(() => {
        setFilesList([...filesList]);
        window.location.reload();
      });
    } catch (error) {
      if (error.response) {
        setErrorMessage("Error while deleting file. Try again later");
      }
    }
  };

  return (
    <div className="wrapper pt-2 pb-5 ">
      {errorMessage && (
        <article className="message is-danger">
          <p className="message-body">{errorMessage}</p>
        </article>
      )}

      {slicedData.length > 0 ? (
        <>
          <table className="table is-fullwidth is-striped">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    onClick={() => {
                      sortHandler(
                        col.sortKey,
                        sortByKey === col.sortKey
                          ? order === "asc"
                            ? "desc"
                            : "asc"
                          : "asc"
                      );
                    }}
                  >
                    {col.label}
                    {sortByKey === col.sortKey && (
                      <span className="icon">
                        {order === "asc" ? (
                          <i className="fas fa-sort-up"></i>
                        ) : (
                          <i className="fas fa-sort-down"></i>
                        )}
                      </span>
                    )}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {slicedData.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.file_mimetype === "image/jpeg" ||
                    item.file_mimetype === "image/jpg" ? (
                      <AiOutlineFileJpg />
                    ) : item.file_mimetype === "image/pdf" ? (
                      <AiOutlineFilePdf />
                    ) : (
                      <SiMxlinux />
                    )}
                  </td>
                  <td
                    onClick={() =>
                      downloadFile(item._id, item.file_path, item.file_mimetype)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {item.filename}
                  </td>
                  <td>{item.description}</td>
                  <td>{item.author}</td>
                  <td>{moment(item.createdAt).format("YYYY-MM-D")}</td>
                  <td>
                    {" "}
                    <button
                      className="delete button is-danger"
                      onClick={() => deleteFile(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <nav className="pagination">
            <a href="/#" className="pagination-previous" onClick={prevPage}>
              Previous
            </a>
            <a href="/#" className="pagination-next" onClick={nextPage}>
              Next
            </a>
            <ul className="pagination-list">
              {pagination.map((page) => {
                if (!page.ellipsis) {
                  return (
                    <li key={page.id}>
                      <a
                        href="/#"
                        className={
                          page.current
                            ? "pagination-link is-current"
                            : "pagination-link"
                        }
                        onClick={(e) => changePage(page.id, e)}
                      >
                        {page.id}
                      </a>
                    </li>
                  );
                } else {
                  return (
                    <li key={page.id}>
                      <span className="pagination-ellipsis">&hellip;</span>
                    </li>
                  );
                }
              })}
            </ul>
          </nav>
        </>
      ) : (
        <div className="message is-link">
          <div className="message-body has-text-centered">
            No results to show. Please upload a file
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesList;
