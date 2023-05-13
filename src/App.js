import React, { useState, useEffect } from 'react';
import { Amplify, Storage } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import awsconfig from './aws-exports';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from './images/logo.png';
Amplify.configure(awsconfig);

const App = ({ signOut, user }) => {
  // State hooks
  const [files, setFiles] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);

  // Fetch files on component mount
  useEffect(() => {
    // Check if files exist in localStorage
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    }

    async function fetchFiles() {
      try {
        const response = await axios.get('/files.json');
        const fileList = response.data;

        const urls = fileList.map((file) => {
          const url = process.env.PUBLIC_URL + file;
          return { key: file, url };
        });

        setFileUrls(urls);
      } catch (error) {
        console.log('Error fetching files: ', error);
      }
    }

    fetchFiles();
  }, []);

  // Handle file upload
  async function handleFileChange(event) {
    const selectedFile = event.target.files[0];
    try {
      await Storage.put(selectedFile.name, selectedFile);
      console.log('File uploaded successfully');

      const newFileKey = selectedFile.name;
      const updatedFiles = [...files, newFileKey];
      setFiles(updatedFiles);

      const url = await Storage.get(newFileKey);
      const updatedFileUrls = [...fileUrls, { key: newFileKey, url }];
      setFileUrls(updatedFileUrls);

      localStorage.setItem('files', JSON.stringify(updatedFiles));
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  // Download file
  async function downloadFile(fileKey) {
    try {
      const url = await Storage.get(fileKey);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileKey);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log('Error downloading file: ', error);
    }
  }

  // Render component
  return (
    <>
      <nav class="navbar bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand fs-2" href="#">
            <img src={Logo} alt="Logo" width="55" height="50" class="d-inline-block align-text-center mr-4" />
            <span class="ml-4 fw-bold">My Dropbox</span>
          </a>
        </div>
      </nav>

      <div style={styles.container}>
      <h2 style={styles.heading}>File Upload</h2>
      <div style={styles.fileContainer}>
        <label htmlFor="fileInput" style={styles.filePreview}>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            style={styles.input}
            multiple
          />
        </label>
      </div>
      {fileUrls.map((fileUrl) => (
  <FilePreview key={fileUrl.key} fileUrl={fileUrl} downloadFile={downloadFile} />
))}
    </div>
    </>
  );
};


const FilePreview = ({ fileUrl, downloadFile }) => (
  <div className="container">
    <div className="card" style={styles.card}>
      <p className="card-title">Uploaded File: {fileUrl.key}</p>
      <img src={fileUrl.url} alt="Uploaded File" style={styles.image} />
      <button
        style={styles.button}
        onClick={() => downloadFile(fileUrl.key)}
      >
        Download File
      </button>
    </div>
  </div>
);




const styles = {
  card:{
    width: 400,
  },
  container: {
    width: 400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
  },
  fileContainer: { display: 'flex', marginBottom: 10 },
  input: { marginRight: 10 },
  button: {
    backgroundColor: 'black',
    color: 'white',
    outline: 'none',
    fontSize: 18,
    padding: '12px 0px',
    marginRight: 10,
  },
  filePreview: { marginTop: 20 },
  image: { width: '100%', height: 'auto' },
};

export default withAuthenticator(App);
