import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from "@fortawesome/free-solid-svg-icons";

// Bootstrap Components
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import Styles from "../styles/styles.module.scss";

// Classes
import APIQueries from "../classes/APIQueries";

const FileView = ({ fileName, showFileView, hideFileView, handleFalseLogin, setAlert, filePublic, getPublicURL }) => {
    const [ contentLoaded, setContentLoaded ] = useState(false);
    const [ publicLink, setPublicLink ] = useState("");

    const getFileURL = (download) => {
        const token = sessionStorage.getItem('access-token');
        if (!token) {
            handleFalseLogin();
            return; 
        }
        const queryDirectory = ['/'].concat(window.location.href.split('dir=')[1].split('/')).filter(dir => dir !== "");
        const currentDirectory = queryDirectory.length && queryDirectory.length !== 1 ? `${queryDirectory.join("-").substring(2)}/` : "BASE";
        const user = JSON.parse(atob(sessionStorage.getItem('user'))); 
        const baseDirectory = user.folderName; 

        return `/api/aws/getFile/${fileName}?baseDirectory=${baseDirectory}&directory=${currentDirectory}&fname=${fileName}&token=${token}&download=${download}`;
    }

    

    const handleMakePublic = () => {
        const token = sessionStorage.getItem('access-token');
        if (!token) {
            handleFalseLogin();
            return; 
        }

        const apiQueries = new APIQueries(token);

        const queryDirectory = ['/'].concat(window.location.href.split('dir=')[1].split('/')).filter(dir => dir !== "");
        const currentDirectory = queryDirectory.length && queryDirectory.length !== 1 ? `${queryDirectory.join("/").substring(2)}/` : "BASE";
        const user = JSON.parse(atob(sessionStorage.getItem('user'))); 
        const userId = user.userId;
        const baseDirectory = user.folderName; 

        if (!userId) {
            return; 
        }

        apiQueries.setObjectPublic(userId, fileName, baseDirectory, currentDirectory).then(res => res.json())
            .then((data) => {
                if (data.success && data.url) {
                    const fullURL = `${window.location.origin}${data.url}`;
                    setPublicLink(fullURL);
                } else {
                    throw new Error("Failed to Complete Request.");
                }
            }).catch(err => {
                console.error(err);
                handleFileViewClose();
                setAlert("Failed to make File Public at this Time. Please Try Again Later.");
            })
    }

    const handleFileViewClose = () => {
        hideFileView();
        setTimeout(() => {
            setContentLoaded(false);
            setPublicLink("");
        }, 250);
    }

    const publicLinkInput = useRef();

    const handleCopyLink = () => {
        const inputElement = publicLinkInput.current; 
        const link = inputElement.value; 
        inputElement.select();
        inputElement.setSelectionRange(0, link.length);
        document.execCommand('copy');
    }

    const handleMakePrivate = () => {

    }

    return (
        <Modal className={Styles.fileObjectContainer} size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={showFileView} onHide={handleFileViewClose}>
            <Modal.Header closeButton>
                <Modal.Title>{ fileName ? fileName : "File" }</Modal.Title>
            </Modal.Header>
            <Modal.Body className={Styles.fileObjectContainer}>
                <div className={Styles.fileObjectButtons}>
                    <Button className={Styles.fileObjectButton} href={filePublic ? getPublicURL(false) : getFileURL(false)} target="_blank" rel="noreferrer">Open Raw</Button>
                    <Button className={Styles.fileObjectButton} href={filePublic ? getPublicURL(true) : getFileURL(true)} target="_blank" rel="noreferrer">Download File</Button>
                    { !filePublic && <> { !publicLink && <Button
                        className={Styles.fileObjectButton}
                        onClick={handleMakePublic}>Make Public</Button>} 
                    
                    { publicLink && <Button
                        className={Styles.fileObjectButton}
                        onClick={handleMakePrivate}>Make Private</Button>} </>}
                </div>
                { publicLink && <div className={Styles.fileObjectLinkContainer}>
                    <input ref={publicLinkInput} className={Styles.fileObjectLink} type="text" contentEditable="false" value={publicLink} />
                    <span className={Styles.fileObjectLinkSpan} onClick={handleCopyLink}>
                        <FontAwesomeIcon icon={faCopy} />
                    </span>
                </div> }
                <div className={Styles.fileObjectSpinner}>
                    { !contentLoaded ? (
                        <Spinner 
                            className={Styles.uploadFilesSpinner}
                            as="span"
                            animation="border"
                            role="status"
                            aria-hidden="true"/>
                    ) : null }
                </div>
                <object onLoad={(e) => {
                    if (e.eventPhase === 2)
                        setContentLoaded(true);
                }} className={Styles.fileObject} data={filePublic ? getPublicURL(false) :getFileURL(false)}>
                    Not Supported
                </object>
            </Modal.Body>
        </Modal>
    )
}

export default FileView; 