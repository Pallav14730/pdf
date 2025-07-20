import React, { useEffect, useRef, useState } from 'react';

const PdfViewer = () => {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [thumbnails, setThumbnails] = useState([]);

  const url = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

  useEffect(() => {
    const loadPDF = async () => {
      const pdfjsLib = window['pdfjsLib'];
      const loadingTask = pdfjsLib.getDocument(url);
      const loadedPdf = await loadingTask.promise;
      setPdf(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      generateThumbnails(loadedPdf);
    };
    loadPDF();
  }, []);

  useEffect(() => {
    if (pdf) renderPage(currentPage);
  }, [pdf, currentPage, scale, rotation]);

  const renderPage = async (pageNum) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale, rotation });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
  };

  const generateThumbnails = async (pdfDoc) => {
    const pdfjsLib = window['pdfjsLib'];
    const thumbs = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 0.2 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL();
      thumbs.push(dataUrl);
    }
    setThumbnails(thumbs);
  };

  return (
    <div className="pdf-container">
      <div id="toolbar">
        <button onClick={() => setScale(scale - 0.2)}>➖</button>
        <span id="zoom-level">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(scale + 0.2)}>➕</button>
        <button style={{ fontSize: '25px' }} onClick={() => setRotation((rotation + 90) % 360)}>⟳</button>
        <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}>←</button>
        <span id="page-info">Page {currentPage} of {totalPages}</span>
        <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}>→</button>
      </div>

      <div id="ui">
        <div id="sidebar">
          {thumbnails.map((thumb, index) => (
            <div
              key={index}
              className={`thumbnail-wrapper ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              <img src={thumb} alt={`Page ${index + 1}`} />
              <span>{index + 1}</span>
            </div>
          ))}
        </div>

        <div id="main">
          <canvas id="pdf-canvas" ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
