import React, { useEffect, useState } from 'react';
import logoattineos from './logoattineos.png';
import ReactPaginate from 'react-paginate';
import './AffichageDesFailles.css';
import Pagination from './Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Popup component
function TextPopup({ onClose }) {
    return (
        <div>
          <h1>Popup Page</h1>
          {/* Add your popup content here */}
        </div>
      );
    
}

export default TextPopup; 