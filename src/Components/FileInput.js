import React from 'react';

const FileInput = ({ onChange, uploading, onSubmit }) => {
  return (
    <div className='file-input'>
      <div>
        <h2>File Upload</h2>
        <div className="fileContainer">
          <input type="file" onChange={onChange} className="input" />
          <div>
            <div className='uploading-file'>
              {uploading && <p>Uploading file...</p>}
            </div>
            <button onClick={onSubmit} className="submitBtn">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileInput;
