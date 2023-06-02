import React, { useEffect, useState } from 'react';
import logoattineos from './logoattineos.png';
import ReactPaginate from 'react-paginate';
import './AffichageDesFailles.css';
import Pagination from './Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Modal, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';


function HideVulnerability({ vulnerability, onHide }) {
  const handleHide = () => {

    onHide(vulnerability.id);
  };
  return (
    <button className="table-hide-button" onClick={handleHide}>Hide</button>
  );
}

function FaillesPage() {
  const { perimeterId } = useParams();
  const [failles, setFailles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [vulnerabilitySolution, setVulnerabilitySolution] = useState('');
  console.log(perimeterId);


  const displayFailles = () => {
    let filteredFailles = Array.isArray(failles) ? [...failles] : [];
  if (searchTerm) {
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    filteredFailles = filteredFailles.filter((faille) =>
      faille.name.toLowerCase().includes(lowercaseSearchTerm)
    );
  }
  if (filterSeverity) {
    filteredFailles = filteredFailles.filter(
      (faille) => faille.severity === filterSeverity
    );
  }
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return Array.isArray(filteredFailles) ? filteredFailles.slice(startIndex, endIndex) : [];
  };
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };
  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(0);
  };
  const handleFilterChange = (event) => {
    setFilterSeverity(event.target.value);
    setCurrentPage(0);
  };
  const handleHideVulnerability = (vulnerabilityId) => {
    setFailles((prevFailles) =>
      prevFailles.map((faille) =>
        faille.id === vulnerabilityId ? { ...faille, hidden: true } : faille
      )
    );
  };
  const handleSolutionTextChange = (event) => {
    setVulnerabilitySolution(event.target.value);
  };
  const handleSaveSolution = () => {
 
    handleClosePopup();
  };

  const handleOpenPopup = (vulnerability) => {
    setVulnerabilitySolution(vulnerability.name);
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  useEffect(() => {
    const fetchFailles = async () => {
      try {
        const response = await fetch(
          `https://127.0.0.1:8001/perimeter/${perimeterId}/vulnerability`
        );
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch failles');
        }
        const data = await response.json();
        const filteredFailles = data.items.filter((faille) => {
          if (searchTerm) {
            const lowercaseSearchTerm = searchTerm.toLowerCase();
            return faille.name.toLowerCase().includes(lowercaseSearchTerm);
          }
          return true;
        });
        setFailles(filteredFailles);
        setPageCount(Math.ceil(filteredFailles.length / itemsPerPage));
      } catch (error) {
        console.error('Error fetching failles:', error);
      }
    };
    fetchFailles();
  }, [perimeterId,searchTerm]);

  return (
    <>
      <header className="bar-1"><img src={logoattineos} className='logo' alt="" /></header>
      <h1>Failles découvertes (Perimeter ID: {perimeterId})</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        /><br />
        <div className="filter-bar">
          <span>Gravités:</span>
          <select value={filterSeverity} onChange={handleFilterChange}>
            <option value="">Toutes</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Informational">Informational</option>
          </select>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Domaine scanné</th>
            <th>Nom de Vulnérabilité</th>
            <th>Gravité</th>
            <th>Cachée</th>
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
          {displayFailles().map((vulnerability) => (
            <tr key={vulnerability.id}>
              <td>{vulnerability.matched_at}</td>
              <td>{vulnerability.name}</td>
              <td>{vulnerability.severity}</td>
              <td>{vulnerability.hidden ? 'Oui' : 'Non'}</td>
              <td>
                <HideVulnerability
                  vulnerability={vulnerability}
                  onHide={handleHideVulnerability} />
                <button
                  className="table-popup-button"
                  onClick={() => handleOpenPopup(vulnerability)}> Solution
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <ReactPaginate
        previousLabel={'Précédent'}
        nextLabel={'Suivant'}
        breakLabel={'...'}
        breakClassName={'break-me'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
      {isPopupOpen && (
        <Modal show={true} onHide={handleClosePopup}>
          <Modal.Header closeButton>
            <Modal.Title>Solution de la vulnérabilité: {vulnerabilitySolution}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <textarea
      value={vulnerabilitySolution}
      onChange={handleSolutionTextChange}
      placeholder="Entrez la solution ici..."
      rows={4}
    />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClosePopup}>
              Fermer
            </Button>
            <Button variant="primary" onClick={handleClosePopup}>
              Enregistrer la solution
            </Button>
          </Modal.Footer>
        </Modal>
      )}</>
  );
}
export default FaillesPage;
