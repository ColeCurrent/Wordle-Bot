import React, { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
    return(
        <div className="header">

            <div className="hamburger">
                <div className="burger burger1" />
                <div className="burger burger1" />
                <div className="burger burger1" />
            </div>

            <div className="icons">
                <img id="settings" src="/public/settings-icon.png" alt="Logo" />
                <img id="question" src="/public/question.png" alt="Logo" />
            </div>

            <div>
                <h1 className="header-text">WORDLE</h1>
                <h1 className="subhead">the modern tale of John Henry</h1>
            </div>

            <hr></hr>

        </div>

    );
};

export default Header;