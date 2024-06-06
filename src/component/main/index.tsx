import React from "react";
import { useEffect, useState, useRef } from "react";
import { fetchData, Postparams, Tagsparams, fetchSeedData } from "../../fetch";
import numeral from "numeral";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../../fetch";
interface TableData {
  postId: number;
  title: string;
  content: string;
  postedAt: string;
  postedBy: string;
  tagsName: string;
}

type DataItem = {
  postId: number;
  title: string;
  postedAt: string;
  postedBy: string;
};

const Main: React.FC = () => {
  const navigate = useNavigate();
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [txtSearch, setTxtSearch] = useState<string>();
  const [data, setData] = useState<TableData[]>([]);
  const [totalRecord, setTotalRecord] = useState<number>(0);
  const [actionDropPage, setActionDropPage] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(50);

  const [actionSortID, setActionSortID] = useState<boolean>(false);
  const [actionSortTitle, setActionSortTitle] = useState<boolean>(false);
  const [actionSortPostAt, setActionSortPostAt] = useState<boolean>(false);
  const [actionSortPostBy, setActionSortPostBy] = useState<boolean>(false);
  const [modalSeed, setModalSeed] = useState<boolean>(false);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [actionProgress, setActionProgress] = useState<boolean>(false);

  const [actionDropSearch, setActionDropSearch] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [dataModal, setDataModal] = useState<string[]>([]);
  const [dataModalTags, setDataModalTags] = useState<string>();
  const section: string[] = ["ID", "Title", "Content", "Tags"];
  const [sectionSearch, setSectionSearch] = useState<string>(section[0]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);

  const [progress, setProgress] = useState<number>(0);

  const seedData = async () => {
    const eventSource = new EventSource(`${serverUrl}/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTotalPosts(data.totalPosts);
      setProgress((prevProgress) => prevProgress + 1);
    };

    const res = await fetchSeedData();
    if (res.data !== undefined) {
      if (res.data.status) {
        loadData(0, limit, "", "");
        setModalSeed(!modalSeed);
        setActionProgress(false);
      }
    }

    eventSource.close();
  };

  useEffect(() => {
    loadData(0, limit, "", "");
  }, []);

  const loadData = async (
    offset: number,
    limit: number,
    search: string,
    section: string
  ) => {
    setLoading(true);
    const params: Postparams = { offset, limit, search, section };
    const res = await fetchData("POST", "/posts/get", params);
    if (res.data !== undefined) {
      setData(res.data.data);
      setTotalRecord(res.data.totalRecord);
      setLoading(false);
    } else {
      navigate("/login");
    }
  };

  const loadDataTags = async (postId: number) => {
    const params: Tagsparams = { postId };
    const res = await fetchData("POST", "/posts/tags", params);
    if (res.data !== undefined) {
      const resultArray: string[] = [];
      res.data.data.forEach((item: { tagsName: string }) => {
        resultArray.push(item.tagsName);
      });
      const result: string = resultArray.join(", ");
      setDataModalTags(result);
    }
  };

  const handleLimit = (total: number) => {
    setLimit(total);
    // loadData(0, total, "", "");
    loadData(0, total, txtSearch || "", sectionSearch);
    setActionDropPage(!actionDropPage);
  };

  const handleShowModal = (postId: number, title: string, content: string) => {
    loadDataTags(postId);
    setDataModal([title, content]);
    setShowModal(!showModal);
  };

  const handleCloseModal = () => {
    setDataModalTags("");
    setDataModal([]);
    setShowModal(false);
  };

  const handleCloseModalSeed = () => {
    setActionProgress(false);
    setModalSeed(!modalSeed);
  };

  const handleSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    loadData(0, limit, txtSearch || "", sectionSearch);
  };

  const sortedData = [...data];
  if (sortConfig !== null) {
    sortedData.sort((a, b) => {
      if (
        a[sortConfig.key as keyof DataItem] <
        b[sortConfig.key as keyof DataItem]
      ) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      if (
        a[sortConfig.key as keyof DataItem] >
        b[sortConfig.key as keyof DataItem]
      ) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      return 0;
    });
  }

  const requestSort = (key: keyof DataItem) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <div className="flex justify-between z-10 relative">
        <div className={`ml-[8px] w-full`}>
          <div className="mt-1">
            <button
              type="button"
              className="text-gray-900 bg-[#F7BE38] hover:bg-[#F7BE88]/90 
              focus:outline-none focus:ring-none focus:border-none font-medium rounded-lg 
              text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2"
              onClick={() => setModalSeed(!modalSeed)}
            >
              <svg
                className="w-6 h-6 text-gray-800"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 18"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                />
              </svg>
              <p className="ml-2">Seed Data Post.json</p>
            </button>
          </div>
          <form className="max-w-lg -mt-1">
            <div className="flex">
              <button
                onClick={() => setActionDropSearch(!actionDropSearch)}
                className="flex-shrink-0 justify-between z-10 inline-flex items-center 
                py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 
                border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-none 
                focus:outline-none focus:ring-gray-100 "
                type="button"
              >
                {sectionSearch}{" "}
                <svg
                  className={`w-2.5 h-2.5 ms-2.5 ${
                    !actionDropSearch && "-rotate-[180deg]"
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <div
                className={`z-10 ${
                  !actionDropSearch && "hidden"
                } bg-white divide-y divide-gray-100 rounded-lg shadow w-44 absolute mt-11`}
              >
                <ul className="py-2 text-sm text-gray-700">
                  {section.map((item, index) => (
                    <li key={item + index}>
                      <button
                        type="button"
                        className="inline-flex w-full px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setSectionSearch(item);
                          setActionDropSearch(!actionDropSearch);
                          inputSearchRef.current?.focus();
                        }}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative w-full">
                <input
                  ref={inputSearchRef}
                  type="search"
                  defaultValue={txtSearch}
                  className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg 
                  border focus:ring-none focus:outline-none"
                  placeholder="Search..."
                  onChange={(e) => setTxtSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch;
                    }
                  }}
                />
                <button
                  className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 
                  rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none 
                  focus:ring-blue-300"
                  onClick={(e) => handleSearch(e)}
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                  <span className="sr-only">Search</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className={`justify-end text-right w-30`}>
          <p className="mr-2">
            TotalRecord : {numeral(totalRecord).format("0,0")}
          </p>
          <button
            onClick={() => setActionDropPage(!actionDropPage)}
            className="mt-2 mr-2 text-white bg-blue-700 justify-between 
            hover:bg-blue-800 focus:ring-none focus:outline-none 
            focus:ring-blue-300 font-medium rounded-lg text-sm 
            px-5 py-2.5 text-center inline-flex items-center w-[90px] h-[35px]"
            type="button"
          >
            {limit}{" "}
            <svg
              className={`w-2.5 h-2.5 ms-3 ${
                !actionDropPage && "-rotate-[180deg]"
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div
            className={`${
              !actionDropPage && "hidden"
            } bg-white divide-y divide-gray-100 rounded-lg shadow items-right`}
          >
            <ul className="py-2 text-sm text-gray-700 text-left">
              <li onClick={() => handleLimit(50)}>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  50
                </a>
              </li>
              <li onClick={() => handleLimit(100)}>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  100
                </a>
              </li>
              <li onClick={() => handleLimit(500)}>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  500
                </a>
              </li>
              <li onClick={() => handleLimit(1000)}>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  1,000
                </a>
              </li>
              <li onClick={() => handleLimit(totalRecord)}>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  {numeral(totalRecord).format("0,0")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="z-0 justify-center items-center relative">
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <span>Loading...</span>
          </div>
        ) : (
          <div
            className={`relative overflow-x-aut py-1 px-2 ${
              actionDropPage && "-mt-[196px]"
            }`}
          >
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 border bg-gray-900 rounded-lg">
              <thead className="text-xs text-white border uppercase bg-white-50">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-3 hover:cursor-pointer"
                    onClick={() => {
                      setActionSortID(!actionSortID);
                      requestSort("postId");
                      setActionSortTitle(false);
                      setActionSortPostAt(false);
                      setActionSortPostBy(false);
                    }}
                  >
                    <button type="button" className="flex">
                      <svg
                        className={`mt-[4px] -ml-[1px] w-2.5 h-2.5 ms-3 ${
                          actionSortID && "-rotate-[180deg]"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>{" "}
                      <p className="ml-2">ID</p>
                    </button>
                  </th>

                  <th
                    scope="col"
                    className="px-2 py-3 hover:cursor-pointer"
                    onClick={() => {
                      setActionSortTitle(!actionSortTitle);
                      requestSort("title");
                      setActionSortID(false);
                      setActionSortPostAt(false);
                      setActionSortPostBy(false);
                    }}
                  >
                    <button type="button" className="flex">
                      <svg
                        className={`mt-[4px] w-2.5 h-2.5 ms-3 ${
                          actionSortTitle && "-rotate-[180deg]"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>{" "}
                      <p className="ml-2">TITLE</p>
                    </button>
                  </th>

                  <th
                    scope="col"
                    className="px-2 py-3 hover:cursor-pointer"
                    onClick={() => {
                      setActionSortPostAt(!actionSortPostAt);
                      requestSort("postedAt");
                      setActionSortID(false);
                      setActionSortTitle(false);
                      setActionSortPostBy(false);
                    }}
                  >
                    <button type="button" className="flex">
                      <svg
                        className={`mt-[4px] w-2.5 h-2.5 ms-3 ${
                          actionSortPostAt && "-rotate-[180deg]"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>{" "}
                      <p className="ml-2">POSTEDAT</p>
                    </button>
                  </th>

                  <th
                    scope="col"
                    className="px-2 py-3 hover:cursor-pointer"
                    onClick={() => {
                      setActionSortPostBy(!actionSortPostBy);
                      requestSort("postedBy");
                      setActionSortID(false);
                      setActionSortTitle(false);
                      setActionSortPostAt(false);
                    }}
                  >
                    <button type="button" className="flex">
                      <svg
                        className={`mt-[4px] w-2.5 h-2.5 ms-3 ${
                          actionSortPostBy && "-rotate-[180deg]"
                        }`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>{" "}
                      <p className="ml-2">POSTEDBY</p>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, index) => (
                  <tr key={item.postedBy + index} className="bg-white border-b">
                    <td className="px-2 py-4">{item.postId}</td>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap hover:text-blue-800 hover:font-bold hover:cursor-pointer"
                      onClick={() =>
                        handleShowModal(item.postId, item.title, item.content)
                      }
                    >
                      {item.title}
                    </th>
                    <td className="px-6 py-4">
                      {new Date(item.postedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{item.postedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
          <div className="relative p-4 w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">
                  {dataModal[0]}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => handleCloseModal()}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              <div
                className="p-4 md:p-5 space-y-4 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                <p
                  className=" leading-relaxed text-gray-500 "
                  dangerouslySetInnerHTML={{ __html: dataModal[1] }}
                />
              </div>

              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <div className="w-[515px]">
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                  focus:ring-none focus:outline-none focus:border-blue-500 block w-full p-2.5"
                    value={
                      "Tags: " + (dataModalTags !== "" ? dataModalTags : "None")
                    }
                    disabled
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCloseModal()}
                  className="ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalSeed && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
          <div className="relative p-4 w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-xl font-semibold text-gray-900">
                  Seed Data Post.json
                </h3>
                <button
                  type="button"
                  className={`${
                    actionProgress && "hidden"
                  } text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto 
                  inline-flex justify-center items-center`}
                  onClick={() => handleCloseModalSeed()}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              <div
                className="p-4 md:p-5 space-y-4 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full dark:bg-purple-500"
                    style={{ width: `${(progress / totalPosts) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div
                className={`${
                  actionProgress && "hidden"
                } flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b`}
              >
                <button
                  data-modal-hide="default-modal"
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium 
                  rounded-lg text-sm px-5 py-2.5 text-center"
                  onClick={() => {
                    setProgress(0); // Reset progress
                    seedData();
                    setActionProgress(!actionProgress);
                  }}
                >
                  start
                </button>
                <button
                  data-modal-hide="default-modal"
                  type="button"
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white 
                  rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 
                  focus:ring-gray-100"
                  onClick={() => handleCloseModalSeed()}
                >
                  close
                </button>
              </div>
            </div>
          </div>
        </div>
        // seedData
      )}
    </>
  );
};

export default Main;
