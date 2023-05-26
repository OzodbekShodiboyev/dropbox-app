import React from 'react';
import fileIcon from '../images/file-icon.png';
import DownIcon from '../images/down-icon.png';

const FilePreview = ({ fileUrl, isImageFile, onDownload }) => {
  return (
    <div key={fileUrl.key} className="filePreview">
      <p>Uploaded File: {fileUrl.key}</p>
      <div>
        <div>
          {isImageFile(fileUrl.key) ? (
            <img src={fileUrl.url} alt="Uploaded File" className="image" />
          ) : (
            <img src={fileIcon} alt="File Icon" className="fileIcon" />
          )}
        </div>
        <div>
          <button className="button" onClick={() => onDownload(fileUrl.key)}>
            <img src={DownIcon} className='down-icon' />
            Download File
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
