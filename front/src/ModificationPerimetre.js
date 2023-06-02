import React, { useEffect, useState } from 'react';
import { useParams ,useNavigate  } from 'react-router-dom';
import logoattineos from './logoattineos.png';
import './DefinitionParam.css';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function ModificationPerimetre() {
  const [domains,setDomains]=useState([]);
  const [ips,setIps]=useState([]);
  const [bannedIps,setBannedIps]=useState([]);
  const [contact_mail,setContactMail]=useState('');
  const [errors, setErrors] = useState({ domains: '', ips: '', bannedIps: '', contactMail: '' });

  const { id } = useParams();
  const navigate = useNavigate ();

  const change = e=>{
    const { name, value } = e.target;
    if (name==="domainNames") {
      const arr = value.split([","]).map(item => item.trim()) ;
      setDomains( arr );
      validateForm(name, value);
    } else if (name === "contactEmail") { 
        setContactMail( value );
        validateForm(name, value);
    }else {
        setErrors({ [name]: value });
      }
  };
  const changeIp = (e)=>{
    const { name, value } = e.target;
    if (name === "ips") {
        setIps( value );
        validateForm(name, value);
    } else if (name === "bannedIps") {
        setBannedIps(  value );
        validateForm(name, value);
    }
    const ips = value.split('\n').map(ip => ip.trim());
      const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
      const isValid = ips.every(ip => ip === "" || ipRegex.test(ip));
      const errorMessage = isValid ? "" : `Addresses IP Invalides: ${ips.filter(ip => !ipRegex.test(ip)).join(', ')}`;
      if (name === "ips") {
        setIps(value);
        setErrors({ ips: errorMessage });
      } else if (name === "bannedIps") {
        setBannedIps(value);
        setErrors({ bannedIps: errorMessage });
      }  };
  
  useEffect(() => {
    // Fetch perimeter data based on the ID
    fetch(`https://127.0.0.1:8001/perimeter/${id}`)
      .then(response => response.json())
      .then(data => {
        setDomains(data.domains || []);
        setIps(data.ips || []);
        setBannedIps(data.bannedIps || []);
        setContactMail(data.contact_mail || '');
      })
      .catch(error => {
        console.error('Error fetching perimeter:', error);
      });
  }, [id]);

  const handleSubmit = e => {
    e.preventDefault();
    let domainArray = [];
    if (Array.isArray(domains)) {
        domainArray = domains; // Use the existing array if it's already an array
    } else if (domains.trim() !== '') {
        domainArray = domains.split(',').map(domain => domain.trim()); // Split the string by comma and trim each domain
    }
    let ipArray = [];
    if (Array.isArray(ips)) {
        ipArray = ips; // Use the existing array if it's already an array
    } else if (ips.trim() !== '') {
        ipArray = ips.split('\n').map(ip => ip.trim()); // Split the string by newline and trim each IP address
    }
    let bannedIpArray = [];
    if (Array.isArray(bannedIps)) {
        bannedIpArray = bannedIps; // Use the existing array if it's already an array
    } else if (bannedIps.trim() !== '') {
        bannedIpArray = bannedIps.split('\n').map(ip => ip.trim()); // Split the string by newline and trim each IP address
    }

    const payload ={
      domainNames:domainArray,
      ips:ipArray,
      bannedIps:bannedIpArray,
      contactEmail: contact_mail,
    }
    console.log("the payload is:", payload);
    fetch(`https://127.0.0.1:8001/perimeter/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response or perform any additional actions
        console.log('Perimeter updated:', data);
        // Redirect to a success page or navigate back to the previous page
        navigate(-1)
      })
      .catch(error => {
        console.error('Error updating perimeter:', error);
        // Handle the error or display an error message
      });
    
  };
  
  const validateForm = (fieldName, value) => {
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
setErrors((prevState) => ({
    ...prevState,
    [`${fieldName}`]: errorMessage,
  }));

  
};
  // Handle form submission
  const { hasErrors } = useState;
  return (
    <div>
      <header className = "bar-1"><img src={logoattineos} className='logo'  alt=""/></header>
        <div>
          <div className="container">
            <h1 className="text-ac4xl font-bold mb-8  mt-5">Modification du périmètre</h1>
            <form onSubmit={handleSubmit}>
            <div className="mb-4 mt-5">
                <label htmlFor="domains">Nom des domaines:</label>
                <input 
                type="text" 
                id="domains" 
                name="domains" 
                className='form-label border border-gray-400 p-2 w-full'
                value={domains} 
                onChange={e =>setDomains(e.target.value)}
                onBlur={() => validateForm("domains", domains)}
                />
                {errors.domains && <span className="error-message">{errors.domains}</span>}
            </div>
            <div className="mb-4 mt-4">
                <label htmlFor="ips">Adresse(s) IP:</label>
                <textarea 
                rows={5}
                type="ips" 
                id="ips" 
                name="ips"
                className="form-label border border-gray-400 p-2 w-full" 
                value={ips} 
                onChange={e =>setIps(e.target.value)}
                onBlur={() => validateForm("ips", ips)}
                />
                {errors.ips && <span className="error-message">{errors.ips}</span>}
            </div>
            <div className="mb-4 mt-4">
                <label htmlFor="bannedIps">Adresse(s)IP à exclure:</label>
                <textarea 
                type="bannedIps" 
                id="bannedIps" 
                name="bannedIps"
                className="form-label border border-gray-400 p-2 w-full" 
                value={bannedIps} 
                onBlur={() => validateForm("bannedIps", bannedIps)}
                onChange={e =>setBannedIps(e.target.value)}/>
                {errors.bannedIps && <span className="error-message">{errors.bannedIps}</span>}
            </div>
            <div className="mb-4 mt-4">
              <label htmlFor="contact_mail">Contact Email:</label>
              <input type="text" id="contact_mail" name="contact_mail"  value={contact_mail} 
                className="form-label border border-gray-400 p-2 w-full"
               onBlur={() => validateForm("contact_mail", contact_mail)}
              onChange={e =>setContactMail(e.target.value)}
              />
              {errors.contactMail && <span className="error-message">{errors.contactMail}</span>}

            </div>
            <div className="button-group">
           <button type="submit" className='centered-button mt-0.5 rounded-button'>Enregistrer les modifications</button>
            </div>
            </form>
          </div>
        </div>
      </div>
  );
}

export default ModificationPerimetre; 