import React ,{Component} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import DefinitionParam from './DefinitionParam.js'
import ModificationPerimetre from './ModificationPerimetre.js'
import DataDisplay from './DataDisplay.js';
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
        </Routes>
      </BrowserRouter>  
    </div>

    
  
  );
}
}

export default App;
