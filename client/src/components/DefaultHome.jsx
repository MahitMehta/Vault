import React, { useEffect, useRef } from "react";
import Button from "react-bootstrap/Button"
import Stats from "../Stats";

// Styles
import Styles from "../styles/styles.module.scss";
import "bootstrap/dist/css/bootstrap.min.css";

// Components
import LoginForm from "./LoginForm.jsx";

const initCanvas = (canvas) => {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    const ctx = canvas.getContext('2d');

    class Circle {
        constructor(x, y, dx, dy, r, ctx, circleArray) {
            this.x = x; 
            this.y = y; 
            this.dx = dx; 
            this.dy = dy; 
            this.r= r; 
            this.ctx = ctx;
            this.circleArray = circleArray;  
        }

        draw() {
            this.ctx.beginPath();
            this.ctx.fillStyle = "#DCEAFF";
            this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            this.ctx.fill();
        }

        update() {
            if (this.x + this.r >= window.innerWidth || this.x - this.r < 0) {
                this.dx = -this.dx; 
            }

            if (this.y + this.r >= window.innerHeight || this.y - this.r < 0) {
                this.dy = -this.dy; 
            }

            // const collisions = this.circleArray.filter(circleObj => {
            //     return this.x + (this.r * 2) >= circleObj.x && circleObj.x >= this.x && (this.y + this.r) <= circleObj.y && circleObj.y >= (this.y);
            // });

            // if (collisions.length >= 1) {
            //     this.dx = -this.dx; 
            // }

            this.x += this.dx;
            this.y += this.dy; 

            this.draw();
        }
    }

    const circleCount = 50; 
    const circleArray = [];

    for (let i = 0; i < circleCount; i++) {
        const r = 10; 

        const x = Math.random() * (window.innerWidth - (2 * r)) + r; 
        const y = Math.random() * (window.innerHeight - (2 * r)) + r; 
        const dx = (Math.random() - 0.5) * 5.5; 
        const dy = (Math.random() - 0.5) * 5.5; 

        const circle = new Circle(x, y, dx, dy, r, ctx, circleArray);
        circleArray.push(circle);
    }

    const canvasEngine = () => {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < circleArray.length; i++) { 
            const circleArrayModified = circleArray.filter((_, idx) => idx !== i);
            circleArray[i].circleArray = circleArrayModified; 
            circleArray[i].update();
        }

         requestAnimationFrame(canvasEngine);
    }

    canvasEngine();
}

function initFirewall(canvas) {
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 

    const ctx = canvas.getContext('2d');
    ctx.font = "15px Arial";
    // ctx.fillText('const firewall = new Firewall(mode="Ultra-Secure");'.substring(0, 3), 100, 100);
    // ctx.fill();
}

const DefaultHome = ({ children }) => {
    const canvas = useRef();

    useEffect(() => {
       initFirewall(canvas.current);
    })

    return (
        <React.Fragment>
            <canvas className={Styles.canvas} ref={canvas}></canvas>
            <main className={Styles.main}>
                { children }
            </main>
        </React.Fragment>
    )
}

export default DefaultHome; 