import React, { useState, useEffect } from 'react';
import { Amplify, Storage, Auth } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from './aws-exports';
import axios from 'axios';
import Navbar from './Components/Navbar';
import FileInput from './Components/FileInput';
import FilePreview from './Components/FilePreview';
import './styles/App.css';
Amplify.configure(awsconfig);

const App = ({ signOut, user }) => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    }
  }, []);

  useEffect(() => {
    async function loadFileUrls() {
      const urls = await Promise.all(
        files.map(async (file) => {
          const url = await Storage.get(file);
          return { key: file, url };
        })
      );
      setFileUrls(urls);
    }

    loadFileUrls();
  }, [files]);

  async function handleFileChange(event) {
    setFile(event.target.files[0]);
  }

  async function uploadFileToS3() {
    if (file) {
      try {
        setUploading(true);
        await Storage.put(file.name, file);
        console.log('File uploaded successfully');

        const newFileKey = file.name;
        const updatedFiles = [...files, newFileKey];
        setFiles(updatedFiles);

        const url = await Storage.get(newFileKey);
        const updatedFileUrls = [...fileUrls, { key: newFileKey, url }];
        setFileUrls(updatedFileUrls);

        localStorage.setItem('files', JSON.stringify(updatedFiles));

        setFile(null); // Reset the selected file
        setUploading(false);
      } catch (error) {
        console.log('Error uploading file: ', error);
        setUploading(false);
      }
    }
  }

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

  function isImageFile(fileKey) {
    const extension = fileKey.split('.').pop();
    return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension.toLowerCase());
  }

  async function handleSignOut() {
    try {
      await Auth.signOut();
      signOut(); // Call the signOut method from withAuthenticator HOC
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  }

  return (
    <>
      <Navbar username={user.username} onSignOut={handleSignOut} />
      <FileInput onChange={handleFileChange} uploading={uploading} onSubmit={uploadFileToS3} />
      <div className="container">
        {fileUrls.map((fileUrl) => (
          <FilePreview
            key={fileUrl.key}
            fileUrl={fileUrl}
            isImageFile={isImageFile}
            onDownload={downloadFile}
          />
        ))}
      </div>
    </>
  );
};

export default withAuthenticator(App);
