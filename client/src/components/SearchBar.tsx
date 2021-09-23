import React from 'react';

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import Styles from "../styles/styles.module.scss";

const SearchBar = () => {
    return (
        <div className={Styles.searchBar}>
            <input placeholder="Search a File..."/>
        </div>
    )
}

export default SearchBar; 