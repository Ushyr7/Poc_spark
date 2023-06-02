import React from 'react';
import './DefinitionParam.css';
import logoattineos from './logoattineos.png';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Link } from 'react-router-dom';
import CertFrTable from './CertFrTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
//import Perimeter from 'C:/Users/HajarLOULIDI/Attispark/Poc_spark/back/src/Entity/Perimeter.php';
export default class DefinitionParam extends React.Component{
    state={
        domainNames: [],
        domainNamesErrorMessage:"",
        ips: [],
        ipsString: "",
        ipValid: true,
        ipErrorMessage: "",
        IpsStringErrorMessage:"",
        bannedIps: [],
        bannedIpsString: "",
        bannedIpsStringErrorMessage:"",
        contactEmail: "",
        contactEmailErrorMessage: "",
        confirmationMessage: "",
        ErrorMessage:"",
        review: false,
        successMessageDisplay: false,
        errorMessageDisplay: false,
        hasErrors: false,
        
    };

    change = e=>{
      const { name, value } = e.target;
      if (name==="domainNames") {
        const arr = value.split([","]).map(item => item.trim()) ;
        this.setState({ [name]: arr });
        this.validateInput(name, value);
      } else if (name === "contactEmail") { 
        this.setState({ [name]: value });
        this.validateInput(name, value);
      } else {
        this.setState({ [name]: value });
      }
    };

    changeIp = (e)=>{
      const { name, value } = e.target;
      if (name === "ipsString") {
          this.setState({ ipsString: value });
          this.validateInput(name, value);
      } else if (name === "bannedIpsString") {
          this.setState({ bannedIpsString: value });
          this.validateInput(name, value);
      }
      const ips = value.split('\n').map(ip => ip.trim());
      const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
      const isValid = ips.every(ip => ip === "" || ipRegex.test(ip));
      const errorMessage = isValid ? "" : `Addresses IP Invalides: ${ips.filter(ip => !ipRegex.test(ip)).join(', ')}`;
      if (name === "ipsString") {
          this.setState({ ipsString: value, IpsStringErrorMessage: errorMessage });
      } else if (name === "bannedIpsString") {
          this.setState({ bannedIpsString: value, bannedIpsStringErrorMessage: errorMessage });
      }  };

    handleKeyPress = (event, name) => {
      if (event.key === 'Enter' || event.key === ' ') {
          const fieldValue = this.state[name];
          this.setState({ [name]: fieldValue + '\n' });
          event.preventDefault();
      }
  };

    onSubmit= async (e) =>{
        e.preventDefault();
        let arr = this.state.ipsString.split(["\n"]).map(item => item.trim()) ;
        arr = arr.filter(function(element) {
            return element !== "";
        });

        this.setState({ ips: arr });
        let arr2 = this.state.bannedIpsString.split(["\n"]).map(item => item.trim()) ;
        arr2 = arr2.filter(function(element) {
            return element !== "";
        });
        this.setState({ bannedIps: arr2 });

        console.log(this.state);

      const payload = {
        domainNames: this.state.domainNames,
        ips: arr,
        bannedIps: arr2,
        contactEmail: this.state.contactEmail,
        
      };
      
      //console.log('request payload',payload);

      try {
        const response = await fetch('https://127.0.0.1:8001/perimeter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (response.ok) {
          console.log('Enregistrement fait avec succés.');
          this.setState({ confirmationMessage: "Enregistrement fait avec succès.", successMessageDisplay: true });
          setTimeout(() => {
            this.setState({ successMessageDisplay: false });
        }, 5000);
        } else {
          console.error("Erreur d'enregistrement.");
          this.setState({ ErrorMessage: "Veuillez vérifier les informations saisies." ,errorMessageDisplay: true });
          setTimeout(() => {
            this.setState({ errorMessageDisplay: false });
        }, 5000); 
        } 
      } catch (error) {
        console.error(error);
        alert("Une erreur s'est produite lors de l'enregistrement.");
      }
      this.setState({
        domainNames: [],
        domainNamesErrorMessage: "",
        ips: [],
        ipsString: "",
        ipValid: true,
        ipErrorMessage: "",
        IpsStringErrorMessage: "",
        bannedIps: [],
        bannedIpsString: "",
        bannedIpsStringErrorMessage: "",
        contactEmail: "",
        contactEmailErrorMessage: "",
      });
    };
    handleReviewClick = () => {
    
        this.setState({ review: true });
    };
  
    handleReviewClose = () => {
      this.setState({ review: false });
    };
    handleButtonClick = (Perimeter) => {
      // Access the id attribute of the perimeter object
      const perimeterId = Perimeter.id;
    };
    
    validateInput = (fieldName, value) => {
      let errorMessage = "";

      if(fieldName=== 'contactEmail'){
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(typeof value =='string'){
          if (value && !emailRegex.test(value)) {
            errorMessage = "Adresse e-mail invalide";
        }
      }else{
        console.log("Invalid value type:", typeof value);
      }
    }else if(fieldName === "domainNames") {
      const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;
      console.log("Value before split:", value);
      if(typeof value ==='string'){
        const domainNames = value.split(",").map(item => item.trim());
        console.log("Value after split:", domainNames);
        const invalidDomains = domainNames.filter(domain => !domainRegex.test(domain));
        if (invalidDomains.length > 0) {
          errorMessage = `Le domaine : ${invalidDomains.join(", ")} n'est pas au bon format`;
        }
      }else{
        console.log("Invalid value type:", typeof value);
      }
    }else if(fieldName === "bannedIpsString" ){
      
      const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
      console.log("Value before split:", value);
      if (value.trim() !== "") {
      
        const ipAddresses = value.split("\n").map(item => item.trim());
        console.log("Value after split:", ipAddresses);
        const invalidIPs = ipAddresses.filter(ip => !ipRegex.test(ip));
        if (invalidIPs.length > 0) {
          errorMessage = `Les adresses IP suivantes ne sont pas au bon format : ${invalidIPs.join(", ")}`;
        }
    }else{
      console.log("Invalid value type:", value);
    }
  }
    this.setState({ [`${fieldName}ErrorMessage`]: errorMessage }, () => {
      // Check if any error message is non-empty and set the hasErrors flag accordingly
      const { contactEmailErrorMessage, domainNamesErrorMessage, IpsStringErrorMessage, bannedIpsStringErrorMessage } = this.state;
      const hasErrors = (contactEmailErrorMessage !== "" || domainNamesErrorMessage !== "" || IpsStringErrorMessage !== "" || bannedIpsStringErrorMessage !== "");
      this.setState({ hasErrors });
    });
  };
  isFormEmpty() {
    const { domainNames, ipsString, contactEmail } = this.state;
    return !domainNames.length && !ipsString && !contactEmail && this.state.bannedIpsString.trim() === "";
  }
    render(){
      const { hasErrors } = this.state;
        return (
          
        <div>
           <header className = "bar-1"><img src={logoattineos} className='logo'  alt=""/></header>
            <div>
            <div className="container">
                <h1 className="text-4xl font-bold mb-8 mt-5">Définition du périmètre</h1>
                <form onSubmit={this.onSubmit}>
                    {/*domainNames Field*/}
                    <div className="mb-4 mt-5">
                        <label htmlFor="domainNames" className="block font-bold mb-2">Nom des domaines <span className="required">*</span></label>
                        <input  
                        //error={this.state.domainNames.length === 0}
                        //helperText={!this.state.domainNames.length ? 'domain name is required' : ''}
                        type="text"
                        id="domainNames"
                        name="domainNames"
                        className="form-label border border-gray-400 p-2"
                        placeholder="domaine1.com, domaine2.com, domaine3.com" 
                        value={this.state.domainNames} 
                        onChange={(e)  => this.change(e)}
                        onBlur={() => this.validateInput("domainNames", this.state.domainNames)}
                        required


                        />
                        {this.state.domainNamesErrorMessage && (
                      <p className="error-message">{this.state.domainNamesErrorMessage}</p>
                    )}
                </div>
               
                {/* ips Field*/}
                <div className="mb-4 mt-4">
                    <label htmlFor="ips" className="block font-bold mb-2">Adresse(s) IP <span className="required">*</span></label>
                    <textarea 
                    rows={5}
                    id="ipsString"
                    name="ipsString"
                    className="form-label border border-gray-400 p-2 w-full"
                    placeholder=" 192.168.0.1 
                    10.0.0.0/24"
                    value={this.state.ipsString} 
                    onChange={(e)  => this.changeIp(e) }
                    onKeyPress={(event) => this.handleKeyPress(event, 'ipsString')}
                    onBlur={() => this.validateInput("ipsString", this.state.ipsString)}
                    required
                    />
                  {this.state.IpsStringErrorMessage && (
                    <p className="error-message">{this.state.IpsStringErrorMessage}</p>
                  )}
                </div>
                  {/* Adresse IP à exclure Field*/}
                  <div className="mb-4  mt-4">
                    <label htmlFor="bannedIps" className="block font-bold mb-2">Adresse(s) IP à exclure</label>
                    <textarea 
                    rows={5}
                    id="bannedIpsString"
                    name="bannedIpsString"
                    className="form-label border border-gray-400 p-2 w-full"
                    placeholder=" 192.168.0.1
                    10.0.0.0
                    172.16.0.0/16" 
                    value={this.state.bannedIpsString} 
                    onChange={(e)  => this.changeIp(e) }
                    onKeyPress={(event) => this.handleKeyPress(event, 'bannedIpsString')}
                    onBlur={() => this.validateInput("bannedIpsString", this.state.bannedIpsString)}
                    
                    
                    />
                      {this.state.bannedIpsStringErrorMessage && (
                      <p className="error-message">{this.state.bannedIpsStringErrorMessage}</p>
                    )}
                </div>

                {/* Mail de contact Field*/}
                <div className="mb-4 mt-4">
                    <label htmlFor="contactEmail" className="block font-bold mb-2">Mail de contact <span className="required">*</span></label>
                    <input 
                    type="text"
                    id="contactEmail"
                    name="contactEmail"
                    className="form-label border border-gray-400 p-2 w-full"
                    placeholder="votreadresse@email.com" 
                    value={this.state.contactEmail} 
                    onChange={(e)  => this.change(e) }
                    onBlur={() => this.validateInput("contactEmail", this.state.contactEmail)}
                    required
                    />
                    {this.state.contactEmailErrorMessage && (
                      <p className="error-message">{this.state.contactEmailErrorMessage}</p>
                    )}
                </div>
                <div className="button-group">
                <button className="centered-button mt-0.5 rounded-button" onMouseDown={this.handleReviewClick} disabled={hasErrors || this.isFormEmpty() }>Vérifier</button>
                <Link to={"/EntityDisplay"}><button  className="centered-button mt-0.5 rounded-button" >Modifier un périmètre</button></Link>
                </div>
                <Dialog open={this.state.review} onClose={this.handleReviewClose}>
                <DialogTitle>Veuillez vérifier vos informations avant de soumettre</DialogTitle>
                <DialogContent>
                  <ul>
                  <li>
                  <span className="font-bold">Nom du domaine:</span> {this.state.domainNames.join(', ')}
                  
                  </li>
                  <li>
                  <span className="font-bold">Adresses IP:</span> {this.state.ipsString.replaceAll("\n", ",").replaceAll(",,", ",")}
                  
                  </li>
                  <li>
                  <span className="font-bold">Adresses IP exclues:</span> {this.state.bannedIpsString.replaceAll("\n", ",")}
                  
                  </li>
                  <li>
                  <span className="font-bold">Email de contact:</span> {this.state.contactEmail}
                  
                  </li>
                  </ul>
                </DialogContent>
                <DialogActions><button onClick={this.handleReviewClose}>Retour</button>
                               <button type="submit" variant="contained" onClick={(e) => this.onSubmit(e)}>Soumettre</button>
      
                </DialogActions>
                {this.state.successMessageDisplay && <p className="success-message">{this.state.confirmationMessage}</p>}
                {this.state.errorMessageDisplay && <p className="error-message">{this.state.ErrorMessage}</p>}
                </Dialog>
                {/* Submit button */}
                
                
            </form>
        </div>
       {/* < CertFrTable />*/}
    </div>
    </div>
        );
    }





}

