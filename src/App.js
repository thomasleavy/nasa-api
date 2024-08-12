//NB: Ensure node server.js is running from its directory. Then use npm start for the front and backends to work together

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import './App.css';

const App = () => {
  const [apod, setApod] = useState(null);
  const apiKey = '0IKlpPLLHRFXl61hO7vt3xnmtc2mlWAqZyc8MicY';
  const localProxy = 'http://localhost:4000/proxy?url=';

  useEffect(() => {
    fetchApod();
  }, []);

  const fetchApod = async () => {
    try {
      const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);
      setApod(response.data);
    } catch (error) {
      console.error('Error fetching data from NASA API', error);
    }
  };

  const convertImageToBase64 = (url, callback) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // allow CORS to work
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      callback(dataURL);
    };
    img.src = url;
  };

  const downloadPdf = () => {
    if (!apod) return;

    if (apod.media_type === 'image' && apod.url) {
      const proxiedImageUrl = `${localProxy}${encodeURIComponent(apod.url)}`;
      convertImageToBase64(proxiedImageUrl, (base64Image) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 15;
        const imgWidth = 180;
        const imgHeight = (imgWidth / 1.78); // aspect ratio

        pdf.addImage(base64Image, 'JPEG', margin, margin, imgWidth, imgHeight);

        let yPosition = imgHeight + margin + 10;

        pdf.setFontSize(12);
        pdf.text(margin, yPosition, `Title: ${apod.title}`);
        yPosition += 10;
        pdf.text(margin, yPosition, `Date: ${apod.date}`);
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.text(margin, yPosition, `Explanation:`);
        yPosition += 10;
        
        // wrap text
        const explanationLines = pdf.splitTextToSize(apod.explanation, imgWidth);
        pdf.text(margin, yPosition, explanationLines);

        pdf.save('nasa_apod.pdf');
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>NASA Astronomy Picture of the Day</h1>
        {apod ? (
          <div id="apod-content" className="apod-container">
            {apod.media_type === 'image' ? (
              <img src={apod.url} alt={apod.title} className="apod-image" />
            ) : (
              <p>Today's content is not an image.</p>
            )}
            <h2>{apod.title}</h2>
            <p>{apod.date}</p>
            <p>{apod.explanation}</p>
            <button onClick={downloadPdf} className="download-button">Download as PDF</button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </header>
    </div>
  );
};

export default App;
