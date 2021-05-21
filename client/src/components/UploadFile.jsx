import React, { useEffect, useRef, useState, useCallback } from 'react';
import APIQueries from "../classes/APIQueries";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";

// Components
import UploadItem from './UploadItem';

// Bootstrap Components
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import Styles from "../styles/styles.module.scss";

const UploadFile = ({ showCreateBucket, handleBucketClose, directory, handleFalseLogin}) => {
    const fileElement = useRef();

    const [ creationError, setCreationError ] = useState("");
    const [ fileInfo, setFileInfo ] = useState([]);
    const [ currentFile, setCurrentFile ] = useState({ fileNumber: 0 }); 
    const [ filesUploading, setFilesUploading ] = useState(false);
    const [ fileOver, setFileOver ] = useState(false);
    const [ dragDropFiles, setDragDropFiles ] = useState([]);

    const token = sessionStorage.getItem('access-token');
    if (!token) {
        handleFalseLogin();
    }

    const apiQueries = new APIQueries(token);

    const handleBucketClosing = (success) => {
        setCreationError("");
        handleBucketClose(success);
    }

    const updateFiles = () => {
        setFileInfo([]);

        const tempFileData = [];
        let files = Array.from(fileElement.current.files); 
        files = files.concat(dragDropFiles);

        files.forEach(file => {
            tempFileData.push({ fname: file.name, complete: 0 });
        });
    
        setFileInfo(tempFileData);
    }

    const uploadNewFiles = useCallback(() => {
        let allFiles = Array.from(fileElement.current.files); 
        allFiles = allFiles.concat(dragDropFiles);
        if (!allFiles.length) return; 
        setFilesUploading(true);
        const formData = new FormData();
        const file = allFiles[currentFile.fileNumber]; 
        formData.append('file', file);
        const baseDirectory = JSON.parse(atob(sessionStorage.getItem('user'))).folderName; 

        // Need to make directory not change 
        const adjustedDir = ['/'].concat(window.location.href.split('dir=')[1].split('/')).filter(dir => dir !== ""); 
        adjustedDir.shift();
        const dir = directory.length ? `${adjustedDir.join("-")}/` : "BASE";

        apiQueries.uploadFiles(formData, fileInfo[currentFile.fileNumber].fname, baseDirectory, dir)
            .then(res => res.json())
            .then(({ operationSuccess }) => {
                    const fileInfoTemp = fileInfo.map((eachFileInfo, idx) => {
                        const eachFileInfoTemp = eachFileInfo;
                        if (idx === currentFile.fileNumber) eachFileInfoTemp.complete = operationSuccess ? 100 : 0; 
                        return eachFileInfoTemp;
                    });
                    setFileInfo(fileInfoTemp);
                    const newCurrentFile = { fileNumber: currentFile.fileNumber + 1};
                    setCurrentFile(newCurrentFile);
                }
            );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiQueries, currentFile.fileNumber]);

    const handleFileStatusFunction = useCallback((fileCount) => {
        if (currentFile.fileNumber < fileCount && currentFile.fileNumber !== 0) {
            uploadNewFiles();
        } else if (currentFile.fileNumber === fileCount && fileCount !== 0) {
            setTimeout(() => {
                setFileInfo([]);
                setCurrentFile({ fileNumber: 0 });
                setFilesUploading(false);
                console.log("closing bucket!");
                handleBucketClose(true);
            }, 500);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFile.fileNumber, handleBucketClose]);

    const handleDragOver = e => {
        e.preventDefault();
        if (!fileOver) {
            setFileOver(true);
        }
    }

    const handleDragLeave = () => {
        if (fileOver) {
            setFileOver(false);
        }
    }

    const handleOnDrop = e => {
        e.preventDefault();

        if (fileOver) {
            setFileOver(false);
        }

        const files = e.dataTransfer.files; 
        let tempDragDropFiles = [];
        tempDragDropFiles = tempDragDropFiles.concat(dragDropFiles);

        if (files.length) {
            for (let i = 0; i < files.length; i++) {
                tempDragDropFiles.push(files[i]);
            }
            setDragDropFiles(tempDragDropFiles);
            updateFiles();
        } 
    }

    useEffect(() => {
        if (fileElement.current) {
            const fileCount = Array.from(fileElement.current.files).concat(dragDropFiles).length; 
            handleFileStatusFunction(fileCount);
        }
    }, [dragDropFiles, handleFileStatusFunction]);


    return (
        <Modal  size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={showCreateBucket} onHide={() => {
            setFileInfo([]);
            setCurrentFile({ fileNumber: 0 });
            setFilesUploading(false);
            handleBucketClosing(false);
        }}>
          <Modal.Header closeButton>
            <Modal.Title style={{ marginLeft: 25 }}>Upload File(s)</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
                <Form.Group className={Styles.uploadFileControl}>
                    <div 
                        onDrop={handleOnDrop}
                        style={ fileOver ? { backgroundColor: "rgba(0, 0, 0, 0.15)"} : { backgroundColor: "rgba(0, 0, 0, 0.05)"}}
                        className={Styles.uploadSection} 
                        onDragOver={handleDragOver} 
                        onDragEnd={handleDragLeave}
                        onDragLeave={handleDragLeave}>
                        <div className={Styles.uploadButtonContainer}>
                            <Button className={Styles.uploadButtonCover}>Upload File</Button>
                            <Form.Control className={Styles.uploadButtonReal} ref={fileElement} multiple type="file" onChange={updateFiles} />
                        </div>
                        <div className={Styles.uploadSectionImage}>
                            <FontAwesomeIcon icon={faImages} className={Styles.uploadImage}/>
                            <p>Drag & Drop</p>
                        </div>
                    </div>
                </Form.Group>
                <Form.Group className={Styles.uploadFileContainer}>
                    { fileInfo.map((info, idx) => {
                        return <UploadItem key={idx} info={info} handleNameChange={(fname) => {
                            let tempFileInfo = [];
                            tempFileInfo = tempFileInfo.concat(fileInfo);
                            tempFileInfo = tempFileInfo.map((tempInfo, tempIdx) => {
                                const tempInfoAltered = tempInfo; 
                                if (tempIdx === idx)
                                    tempInfo.fname = fname; 
                                return tempInfoAltered;
                            });
                            return tempFileInfo; 
                        }}/>
                    })}
                </Form.Group>
            </Form>
            { creationError ? (
                <Alert variant="danger">{ creationError }</Alert>
            ) : null }
            
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
                setFileInfo([]);
                setCurrentFile({ fileNumber: 0 });
                setFilesUploading(false);
                handleBucketClosing(false);
            }}>
              Cancel
            </Button>
            <Button className={Styles.uploadFilesButton} variant="primary" onClick={uploadNewFiles}>
                {
                    filesUploading ? (
                        <Spinner
                            className={Styles.uploadFilesSpinner}
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    ) : null
                }
                Upload File(s)
            </Button>
          </Modal.Footer>
        </Modal>
    );
}

export default UploadFile; 