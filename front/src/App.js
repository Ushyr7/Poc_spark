import React ,{Component} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import DefinitionParam from './DefinitionParam.js'
import ModificationPerimetre from './ModificationPerimetre.js'
import DataDisplay from './DataDisplay.js';
import FaillesPage from './AffichageDesFailles.js';
import TextPopup from './PopupSolution';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
class App extends Component {
  render(){
  return (
    <div >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefinitionParam />}></Route>
          <Route path="/modification-perimetre/:id" element={<ModificationPerimetre/>} />
          <Route path="/definition-perimetre" element={<DefinitionParam />}/>  
          <Route path="/EntityDisplay" element={<DataDisplay />}/> 
          <Route path="/perimeter/:perimeterId/vulnerability" element={<FaillesPage />}/>
          <Route path="/VulnrabilitySolution" element={<TextPopup/>}/>
        </Routes>
      </BrowserRouter>  
    </div>

    
  
  );
}
}

export default App;
