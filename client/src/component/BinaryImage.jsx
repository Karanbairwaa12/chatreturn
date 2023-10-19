import React from 'react';

const BinaryImage = ({ contentType, data, i}) => {

  const _arrayBufferToBase64 = (data ) => {
    var binary = '';
    var bytes = new Uint8Array(data );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }
  // Convert the binary data to a base64-encoded string
  // console.log(i,data)
  // const base64String = btoa(String.fromCharCode(...new Uint8Array(data)));
  // console.log("after",base64String)
  // Create the data URL
  const dataURL = `data:${contentType};base64,${_arrayBufferToBase64(data)}`;

  return (
    <img src={dataURL} alt="Profile Pic" />
  );
};

export default BinaryImage;

