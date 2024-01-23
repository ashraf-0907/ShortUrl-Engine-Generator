import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MDBDataTable } from "mdbreact";
import "./FormContainer.css";

const FormContainer = () => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("Generate ShortUrl");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSection, setCurrentSection] = useState("createUrl");
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [searchOption, setSearchOption] = useState("global_url");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("clickCount");

  const handleCreateUrl = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid URL.");
      return;
    }

    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      toast.error("Please enter a valid URL.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v2/createUrl",
        {
          global_url: url,
          phoneNumbers: phoneNumber,
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "text/csv" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");

      setUrl("");
      setPhoneNumber("");
      setIsVerified(false);
      toast.success("URL created successfully!");
    } catch (error) {
      console.error("Error in sending the data", error);
      toast.error("There was an issue submitting the form. Please try again.");
    }
  };

  const handleCreateState = () => {
    setCurrentSection("createState");
  };

  const handleSearch = async () => {
    const urlPattern =
      /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;

    if (
      searchInput.length === 0 ||
      !(/^[0-9]{10}$/.test(searchInput) || urlPattern.test(searchInput))
    ) {
      toast.error("Not a valid Input Query");
      return;
    }

    const option = /^[0-9]{10}$/.test(searchInput) ? "user_pno" : "global_url";

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v2/analytics",
        {
          search: searchInput,
          searchOption: option,
        }
      );

      setSearchResults(response.data.data.analytics);
      setSearchOption(option);

      // Show a toast if search results are empty
      if (response.data.data.analytics.length === 0) {
        toast.info("No records found for the given query.");
      }
    } catch (error) {
      console.error("Error in fetching search results", error);
    }
  };

  const handleVerify = () => {
    const numbersArray = phoneNumber
      .split(",")
      .map((number) => number.trim())
      .filter((number) => /^[0-9]{10}$/.test(number))
      .filter((number, index, self) => self.indexOf(number) === index);

    if (numbersArray.length === 0) {
      toast.error("Please enter valid phone numbers before verifying.");
      return;
    }

    setVerifiedCount(numbersArray.length);
    setPhoneNumber(numbersArray);
    setIsVerified(true);
  };

  const sortedResults = [...searchResults].sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy] - b[sortBy];
    } else {
      return b[sortBy] - a[sortBy];
    }
  });

  const data = {
    columns:
      searchOption === "user_pno"
        ? [
            { label: "Global URL", field: "global_url" },
            { label: "Clicks", field: "clickCount" },
            { label: "Last Clicked", field: "lastTime" },
          ]
        : [
            { label: "Phone Number", field: "user_pno" },
            { label: "Clicks", field: "clickCount" },
            { label: "Last Clicked", field: "lastTime" },
          ],
    rows: sortedResults.map((result) => ({
      global_url: result.global_url,
      user_pno: result.user_pno,
      clickCount: result.clickCount,
      lastTime: result.lastTime,
    })),
  };

  return (
    <div>
      <h2>{name}</h2>
      <div>
        <button
          onClick={() => {
            setCurrentSection("createUrl");
            setName("Generate ShortUrl");
          }}
        >
          Create URL
        </button>
        <button
          onClick={() => {
            setCurrentSection("createState");
            setName("Stats");
          }}
        >
          Stats
        </button>
      </div>

      {/* Wrap your component with ToastContainer */}
      <ToastContainer />

      {currentSection === "createUrl" && (
        <div>
          <input
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <textarea
            name="paragraph_text"
            type="text"
            placeholder="Phone Number (comma-separated)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            cols="60"
            rows="10"
          ></textarea>

          {isVerified && <div>Valid Count: {verifiedCount}</div>}
          <div style={{ textAlign: "right" }}>
            <button onClick={handleVerify}>Verify</button>
          </div>

          {isVerified && <button onClick={handleCreateUrl}>Submit</button>}
        </div>
      )}

      {currentSection === "createState" && (
        <div>
          <input
            type="text"
            placeholder="Search URL/Phone Number"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button onClick={() => handleSearch()}>Search</button>

          {searchResults.length > 0 && (
            <div
              style={{
                padding: "10px",
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid #ccc",
              }}
            >
              <MDBDataTable striped bordered small data={data} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormContainer;
