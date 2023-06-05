import React from 'react';

const Pagination = ({ pageCount, currentPage, onPageChange }) => {
  const handlePageClick = (selectedPage) => {
    onPageChange(selectedPage);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    for (let i = 0; i < pageCount; i++) {
      const pageNumber = i;
      const isActive = pageNumber === currentPage;

      pageNumbers.push(
        <li key={i} className={`page-item ${isActive ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageClick(pageNumber)}>
            {pageNumber + 1}
          </button>
        </li>
      );
    }

    return pageNumbers;
  };

  return (
    <nav>
      <ul className="pagination">
        {renderPageNumbers()}
      </ul>
    </nav>
  );
};

export default Pagination;