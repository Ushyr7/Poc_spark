import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  // Créer un tableau de numéros de page
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination-container">
      <ul className="pagination">
        {/* Bouton précédent */}
        {currentPage > 1 && (
          <li>
            <a href="#" onClick={() => onPageChange(currentPage - 1)}>
              &laquo; Précédent
            </a>
          </li>
        )}

        {/* Numéros de page */}
        {pageNumbers.map((pageNumber) => (
          <li key={pageNumber} className={currentPage === pageNumber ? 'active' : ''}>
            <a href="#" onClick={() => onPageChange(pageNumber)}>
              {pageNumber}
            </a>
          </li>
        ))}

        {/* Bouton suivant */}
        {currentPage < totalPages && (
          <li>
            <a href="#" onClick={() => onPageChange(currentPage + 1)}>
              Suivant &raquo;
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Pagination;