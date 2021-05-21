import React, { useEffect, useRef, useState, useCallback } from 'react';

// Bootstrap Components
import ProgressBar from "react-bootstrap/ProgressBar";
import Form from "react-bootstrap/Form";

// Styles
import Styles from "../styles/styles.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const UploadItem = ({ info, handleNameChange }) => {
    const progressBar = useRef();

    const extractName = useCallback((fname, extension=false) => {
        const splittedName = fname.split('.');
        const partsOfName = splittedName.slice(0, splittedName.length - 1);
        return extension ? `.${splittedName[splittedName.length - 1]}` : partsOfName.join('.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [info.fname]); 

    const [ nameVal, setNameVal ] = useState(info ? extractName(info.fname) : "");
    // console.log(info);
    useEffect(() => {
        if (info.complete > 0) {
            const element = progressBar.current;
            element.scrollIntoView();
        }
    });

    return (
        <div className={Styles.uploadItem} ref={progressBar}>
            <Form.Control 
                onChange={e => {
                    setNameVal(e.currentTarget.value);
                    handleNameChange(nameVal + extractName(info.fname, true));
                }} 
                className={Styles.uploadItemName} 
                type="text" value={nameVal} 
                placeholder="File Name" />
            <ProgressBar animated style={{ width: "100%" }} now={info.complete ? info.complete : 0} />
        </div>
    )
}

export default UploadItem; 