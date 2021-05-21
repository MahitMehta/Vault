import React, { useRef, useState } from 'react';
import APIQueries from "../classes/APIQueries";

// Bootstrap Components
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";

const CreateBucket = ({ showCreateBucket, handleBucketClose, directory }) => {
    const bucketName = useRef();
    const bucketLocation = useRef();

    const [ creationError, setCreationError ] = useState("");

    const handleBucketClosing = (success) => {
        setCreationError("");
        handleBucketClose(success);
    }

    const createNewFolder = ({ handleFalseLogin }) => {
        const folderNameValue = bucketName.current.value;
        // const locationOptionIndex = bucketLocation.current.selectedIndex;
        // const locationOption = Array.from(bucketLocation.current.children)[locationOptionIndex].innerHTML;
        
        if (!folderNameValue) {
            setCreationError("Please Enter A Valid Name.");
            return;
        }

        const token = sessionStorage.getItem('access-token');
        if (!token) {
            handleFalseLogin();
            return; 
        }

        const apiQueries = new APIQueries(token);
        const user = JSON.parse(atob(sessionStorage.getItem('user'))); 
        
        const baseDirectory = user.folderName; 
        const userId = user.userId; 
        let adjustedDir = directory; 
        adjustedDir.shift();
        const dir = directory.length ? `${adjustedDir.join("-")}/` : "BASE";
        apiQueries.createFolder(folderNameValue, userId, baseDirectory, dir)
            .then(res => res.json())
            .then(({ operationSuccess }) => {
                if (operationSuccess) {
                    handleBucketClosing(true)
                } else {
                    setCreationError("Failed to Create Bucket. Try Again Later.");
                    handleBucketClosing(true);
                }
            })
            .catch(() => {
                setCreationError("Failed to Create Bucket. Try Again Later.");
                handleBucketClosing(true);
            });
    //     apiQueries.loadAWSBuckets(bucketNameValue, locationOption)
    //     .then(res => res.json())
    //     .then(data => {
    //         const success = data.operationSuccess; 

    //         if (!success) {
    //             switch (data.code) {
    //                 case "BucketAlreadyOwnedByYou": {
    //                     setCreationError("Bucket Name Exists. Please Try Another Name.");
    //                     return; 
    //                 }
    //                 default: {
    //                     setCreationError("Failed to Create Bucket. Try Again Later.");
    //                 }
    //             }
    //         } else {
    //             handleBucketClosing(true);
    //         }
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     })
    }

    return (
        <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={showCreateBucket} onHide={() => {
            handleBucketClosing(false);
        }}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Folder</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
                <Form.Group>
                    <Form.Label>Folder Name</Form.Label>
                    <Form.Control ref={bucketName} type="text" placeholder="Enter Name" />
                    <Form.Text className="text-muted">
                        Make Sure Folder Name is Unique.
                    </Form.Text>
                </Form.Group>

                <Form.Group>
                    <Form.Label>Folder Location</Form.Label>
                    <Form.Control ref={bucketLocation} as="select">
                        <option>us-east-2</option>
                    </Form.Control>
                </Form.Group>
            </Form>
            { creationError ? (
                <Alert variant="danger">{ creationError }</Alert>
            ) : null }
            
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
                handleBucketClosing(false);
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={createNewFolder}>
              Initialize New Folder
            </Button>
          </Modal.Footer>
        </Modal>
    );
}

export default CreateBucket; 