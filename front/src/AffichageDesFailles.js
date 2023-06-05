import React, { useEffect, useState } from 'react';
import logoattineos from './logoattineos.png';
import ReactPaginate from 'react-paginate';
import './AffichageDesFailles.css';
import Pagination from './Pagination';

import { Modal, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';


function HideVulnerability({ vulnerability, onHide, showHiddenVulnerabilities }) {
  const handleHide = () => {

    onHide(vulnerability.id);
  };
  const buttonLabel = vulnerability.hidden ? 'Vrai Positif' : 'Faux Positif';
  return (
    <button className="table-hide-button" onClick={handleHide}>{buttonLabel}</button>
  );
}

function FaillesPage() {
  const { perimeterId } = useParams();
  const [failles, setFailles] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 50;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [vulnerabilitySolution, setVulnerabilitySolution] = useState('');
  const [showHiddenVulnerabilities, setShowHiddenVulnerabilities] = useState(false);
  console.log(perimeterId);


  const displayFailles = () => {
    let filteredFailles = [...failles];
    if (searchTerm) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filteredFailles = filteredFailles.filter((faille) =>
        faille.name.toLowerCase().includes(lowercaseSearchTerm) ||
        faille.matched_at.toLowerCase().includes(lowercaseSearchTerm)
      );
    }
    if (filterSeverity) {
      filteredFailles = filteredFailles.filter(
        (faille) => faille.severity === filterSeverity
      );
    }

    if (!showHiddenVulnerabilities) {
      filteredFailles = filteredFailles.filter((faille) => !faille.hidden);
    }
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return Array.isArray(filteredFailles) ? filteredFailles : [];
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
        faille.id === vulnerabilityId ? { ...faille, hidden: !faille.hidden } : faille
      )
    );
    localStorage.setItem(`hiddenVulnerability_${vulnerabilityId}`, !failles.find((faille) => faille.id === vulnerabilityId).hidden);
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

  const handleShowHiddenVulnerabilities = (event) => {
    setShowHiddenVulnerabilities(event.target.checked);
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

        const updatedFailles = data.items.map((faille) => {
          const isHidden = localStorage.getItem(`hiddenVulnerability_${faille.id}`
          );
          return { ...faille, hidden: isHidden === 'true' };
        });
        setFailles(updatedFailles);
        setPageCount(Math.ceil(updatedFailles.length / itemsPerPage));
        console.log('les failles sont:', updatedFailles);
      } catch (error) {
        console.error('Error fetching failles:', error);
      }
    };
    fetchFailles();

  }, [perimeterId, searchTerm, pageCount]);

  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setShowHiddenVulnerabilities(true);
    } else {
      setShowHiddenVulnerabilities(false);
    }
  };

  return (
    <>
      <header className="bar-1"><img src={logoattineos} className='logo' alt="" /></header>
      <h1>Failles découvertes </h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        /><br />
        <div className="filter-bar">
          <span>Gravité:</span>
          <select value={filterSeverity} onChange={handleFilterChange}>
            <option value="">Toutes</option>
            <option value="critical">Critique</option>
            <option value="high">Élevé</option>
            <option value="medium">Moyen</option>
            <option value="low">Faible</option>
            <option value="info">Informationnel</option>
          </select>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Domaine scanné</th>
            <th>Nom de Vulnérabilité</th>
            {/*<th>Gravité</th>
            <th>Cachée</th>
            <th>Description</th>*/}
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
          {displayFailles().map((vulnerability) => (
            <tr key={vulnerability.id}>
              <td>{vulnerability.matched_at}</td>
              <td>{vulnerability.name}</td>
              {/*<td>{vulnerability.severity}</td>
              <td>{vulnerability.hidden ? 'Oui' : 'Non'}</td>
              <td>{vulnerability.description &&
              <div dangerouslySetInnerHTML={{ __html: vulnerability.description.replace(/\./g, '.<br/>') }}></div>}</td>*/}
              <td>
                <HideVulnerability
                  vulnerability={vulnerability}
                  onHide={handleHideVulnerability}
                />
                <button
                  className="table-popup-button"
                  onClick={() => handleOpenPopup(vulnerability)}> Corriger
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <ReactPaginate
          previousLabel={'Précédent'}
          nextLabel={'Suivant'}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={2}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}

          activeClassName={'active'}
        />
      </div>
      <div className='revealhiddenvulnerabilities'>
        <label className='checkboxlabel'>
          <input class="form-check-input"
            type="checkbox"
            checked={showHiddenVulnerabilities}
            onChange={handleShowHiddenVulnerabilities}
          />{' '}
          Afficher les vulnérabilités Cachées
        </label>
      </div>
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
