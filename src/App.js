//import logo from './logo.svg';
import './App.css';
import CardComponent from './components/CardComponent';

import { initializeApp } from "firebase/app";
import { getDocs, getFirestore } from "firebase/firestore";
import { collection, query, where, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';

function App() {

  const [user, setUser] = useState(null);

  const queryParams = new URLSearchParams(window.location.search);

  const firebaseConfig = {
    apiKey: "AIzaSyBGZfYol1lltWx7GCg3dbFI7JcFCsojMmY",
    authDomain: "ptecho-sandbox-payments.firebaseapp.com",
    projectId: "ptecho-sandbox-payments",
    storageBucket: "ptecho-sandbox-payments.appspot.com",
    messagingSenderId: "51664431008",
    appId: "1:51664431008:web:878630254151525a5e66c5",
    measurementId: "G-49X3B5P6XJ"
  };


  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  if (queryParams.get('merchant') && !user) {
      const docRef = doc(firestore, 'users', queryParams.get('merchant'));
      getDoc(docRef).then(docSnap=>{
        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          setUser(docSnap.data())
        } else {
          console.log("No such Merchant!");
        }
      })
    }

  const businessName = (user) ? user.businessName : ''

  if (!user) {
    return(
      <div className="App">
      <header className="App-header">

        <div style={{
          margin: 10
        }}>
          <h4 style={{ color: 'red' }}>
            PTechO SandBox Payment API
          </h4>

          <h5>
            {"Getting Merchant Information"}
          </h5>

        </div>

      </header>
    </div>
    )
  }
  
  else{
    return (
      <div className="App">
        <header className="App-header">
  
          <div style={{
            margin: 10
          }}>
            <h4 style={{ color: 'purple' }}>
              PTechO SandBox Payment API
            </h4>
  
            <h5>
              {"Merchant: " + businessName}
            </h5>
  
  
            <p>
              {"Amount: " + queryParams.get('amount') + " " + 'Rs.'}
            </p>
  
            <CardComponent merchant={user} amount={queryParams.get('amount')}/>
  
  
          </div>
  
          
  
        </header>
      </div>
    );
  }

  
}

export default App;
