import { useShinyOutput } from "@posit/shiny-react";
import React, { useRef, useState } from "react";
import InputOutputCard from "./InputOutputCard";

function FileInputCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileout, _] = useShinyOutput<string>("fileout", undefined);

  const handleFiles = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFiles(fileArray);
    } else {
      setFiles([]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const inputElement = (
    <div>
      {/*
        Hidden file input - Shiny will automatically detect this create a
        corresponding Shiny input with the same name as the id.
      */}
      <input
        ref={inputRef}
        type='file'
        id='filein'
        multiple={true}
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      {/* Custom drag and drop area */}
      <div
        className={`file-drop-zone ${isDragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className='file-drop-content'>
          {files.length === 0 ? (
            <>
              <div className='file-drop-text'>
                Click to select files or drag and drop them here
              </div>
              <div className='file-drop-hint'>Multiple files are supported</div>
            </>
          ) : (
            <div className='selected-files'>
              <ul className='selected-files-list'>
                {files.map((file, index) => (
                  <li key={index}>
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </li>
                ))}
              </ul>
              <div className='file-drop-hint'>
                Click to select different files or drag new ones here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  const outputElement = (
    <pre className='code-output'>{JSON.stringify(fileout, null, 2)}</pre>
  );

  return (
    <InputOutputCard
      title='File Input'
      inputElement={inputElement}
      outputValue={outputElement}
      layout='vertical'
    />
  );
}

export default FileInputCard;
