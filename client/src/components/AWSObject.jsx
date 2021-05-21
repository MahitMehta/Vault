import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as FaIcon from "@fortawesome/free-solid-svg-icons";


// Constants
import { EXTENSIONS, EXTENSIONSTYLES } from "./contants";

// Styles
import Styles from "../styles/styles.module.scss";

const AWSObject = ({ file, handleClick }) => {
    //console.log(file);
    const [ fileName, setFileName ] = useState("");
    const [ awsObjectStyles, setAWSObjectStyles ] = useState({});
    const [ awsObjectGraphic, setAWSObjectGraphic ] = useState("");

    useEffect(() => {
        if (file) {
            try {
                const fileNameSplitted = file.match(/\/[0-9A-z().\s-]+$/);
                const fileNameCurrentDirectory = fileNameSplitted[fileNameSplitted.length - 1];
                const fileNameCurrentDirectoryEnd = fileNameCurrentDirectory.split('.');
                const fileSegments = fileNameCurrentDirectory.split('/'); 
                //sconsole.log(fileSegments);
                setFileName(fileSegments[fileSegments.length - 1]);
                const fileExtension = fileNameCurrentDirectoryEnd[fileNameCurrentDirectoryEnd.length - 1].toLowerCase();
                const styleCode = EXTENSIONS[fileExtension]; 

                let awsObjectSettings;
                if (styleCode)
                    awsObjectSettings = EXTENSIONSTYLES[styleCode]; 
                else 
                    awsObjectSettings = EXTENSIONSTYLES['default'];

                setAWSObjectStyles(awsObjectSettings[0]);
                setAWSObjectGraphic(awsObjectSettings[1]);
            } catch (err) {
                // pass
            }
        }
    }, [file]);

    return (
        <React.Fragment>
            <div className={Styles.awsObjectWrapper} onClick={() => {
                handleClick(fileName);
            }}>
                <div style={awsObjectStyles} className={Styles.awsObject}>
                    <FontAwesomeIcon className={Styles.awsObjectIcon} icon={FaIcon[awsObjectGraphic] ? FaIcon[awsObjectGraphic] : FaIcon['faFile']} />
                </div>
                <p className={Styles.awsObjectName}>{ fileName }</p>
            </div>
        </React.Fragment>
    )
}

export default AWSObject; 