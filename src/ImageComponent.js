import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import './ImageComponent.css'



const ImageComponent = () => {
  const [userInput, setUserInput] = useState('');
  const [comicImages, setComicImages] = useState([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const imageRefs = useRef([]);

  const imageUrls = [];
  const fetchData = async () => {
    try {
      setLoading(true);

      const baseInput = userInput.trim();
      const frameCount = 10;

      if (baseInput !== '') {
        
        for (let index = 0; index < frameCount; index++) {
          const data = { inputs: `${baseInput} - Frame ${index + 1}` };
          const imageBlob = await query(data);
          const imageUrl = URL.createObjectURL(imageBlob);
          console.log(Array.isArray(imageUrls));

          imageUrls.push(imageUrl);
          setComicImages([...imageUrls]); // Update state after each image is generated
        }
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false); // Set loading to false when the data fetching is complete (or in case of an error)
    }
  };

  const handleButtonClick = () => {
    fetchData();
  };



  const shareImage = async (imageRef) => {
    if (imageRef.current) {
      try {
        const canvas = await html2canvas(imageRef.current);
        const image_captured =canvas.toDataURL('image/png');
        
          const byteString =atob(image_captured.split(',')[1]);
          const ab =new ArrayBuffer(byteString.length);
          const ia =new Uint8Array(ab);
          for(let i=0;i<byteString.length;i++)
          {
            ia[i]=byteString.charCodeAt(i);
          }
        
          const blob =new Blob([ab],{type:'image/png'})
        const file = new File([blob], 'comic_frame.png', { type: 'image/png' });

        if (navigator.share) {
          navigator.share({
            files: [file],
          });
        } else {
          console.warn('navigator.share is not supported');
        }
      } catch (error) {
        console.error('Error capturing or sharing image:', error);
      }
    }
  };


  return (
    <div className="comic-strip-container">
      <label htmlFor="comicInput">Enter text for comic:</label>
      <input
        type="text"
        id="comicInput"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={handleButtonClick}>Generate Comic</button>

      {loading && <div className="loading-indicator"></div>}

      <div className="comic-strip">
        {comicImages.map((image, index) => (
          <div key={index} className="comic-frame">
            <img
              ref={(ref) => (imageRefs.current[index] = ref)}
              src={image}
              alt={`Frame ${index + 1}`}
            />
            <button onClick={() => shareImage(imageRefs.current[index])}>Share</button>
          </div>
        ))}
      </div>
    </div>
  );
};

async function query(data) {
  const response = await fetch(
    "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud", // Replace with your API endpoint
    {
      headers: {
        "Accept": "image/png",
        "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM", // Replace with your authorization token
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.blob();
  return result;
}

export default ImageComponent;
