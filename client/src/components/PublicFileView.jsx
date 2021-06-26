import React from 'react';

// Components
import FileView from "./FileView";

const PublicFileView = ({ match }) => {
    const [ fileName, setFileName ] = React.useState("");

    const formatImageURL = (download) => {
        const userId = match.params.userId; 
        if (!userId) return "";

        const paramPairs = window.location.search.substring(1).split("&");
        const params = {};

        paramPairs.forEach(param => {
            const [ key, value ] = param.split("=");
            params[key] = value; 
        });

        if (!fileName) {
            setFileName(params.fname ? params.fname : 'File');
        }

        const url = `/api/public/getPublicObject?userId=${userId}&fileId=${params.id}&fname=${params.fname}&download=${download}`;

        return url;
    }

    const handleFalseLogin = () => {

    }

    return (
        <FileView 
            fileName={fileName} 
            getPublicURL={formatImageURL}
            showFileView={true}
            filePublic={true}
            handleFalseLogin={handleFalseLogin}/>
    )
}

export default PublicFileView; 