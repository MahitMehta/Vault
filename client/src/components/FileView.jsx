import React from 'react';

// Bootstrap Components
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import Styles from "../styles/styles.module.scss";

const FileView = ({ fileName, showFileView, hideFileView, handleFalseLogin }) => {
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

        return `http://localhost:5000/api/aws/getFile/${fileName}?baseDirectory=${baseDirectory}&directory=${currentDirectory}&fname=${fileName}&token=${token}&download=${download}`;
    }

    return (
        <Modal className={Styles.fileObjectContainer} size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={showFileView} onHide={hideFileView}>
            <Modal.Header closeButton>
                <Modal.Title>{ fileName ? fileName : "File" }</Modal.Title>
            </Modal.Header>
            <Modal.Body className={Styles.fileObjectContainer}>
                <div className={Styles.fileObjectButtons}>
                    <Button className={Styles.fileObjectButton} href={getFileURL(false)} target="_blank" rel="noreferrer">Open Raw</Button>
                    <Button className={Styles.fileObjectButton} href={getFileURL(true)} target="_blank" rel="noreferrer">Download File</Button>
                </div>
                <object className={Styles.fileObject} data={getFileURL(false)}>
                    Not Supported
                </object>
            </Modal.Body>
        </Modal>
    )
}

export default FileView; 