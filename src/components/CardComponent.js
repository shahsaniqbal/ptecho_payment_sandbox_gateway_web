import * as React from 'react'
import Cards from 'react-credit-cards';
import 'react-credit-cards/es/styles-compiled.css'
import './CardComponent.css'

import { initializeApp } from "firebase/app";
import { getDocs, getFirestore, doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { collection, query, where } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBGZfYol1lltWx7GCg3dbFI7JcFCsojMmY",
    authDomain: "ptecho-sandbox-payments.firebaseapp.com",
    projectId: "ptecho-sandbox-payments",
    storageBucket: "ptecho-sandbox-payments.appspot.com",
    messagingSenderId: "51664431008",
    appId: "1:51664431008:web:878630254151525a5e66c5",
    measurementId: "G-49X3B5P6XJ"
};



export default class CardComponent extends React.Component {
    state = {
        cvc: '',
        expiry: '',
        focus: '',
        name: '',
        number: '4',
    };


    handleInputFocus = (e) => {
        this.setState({ focus: e.target.name });
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;

        this.setState({ [name]: value });
    }


    render() {

        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);


        const { merchant, amount } = this.props;

        const sendError = (url, errorText) => {
            window.location.replace(url + "?" + 'error=' + errorText  + '&' + 'isSuccess=' + false);
         }

        const sendResponse = (url, transactionID, isSuccess, message) => {
            console.log('Response Method '  + isSuccess);
            window.location.replace(url + "?" + 'transaction=' + transactionID  + '&' + 'isSuccess=' + isSuccess  + '&' + 'message=' + message);
        }

        const postDataL = async () => {

            if (!(this.state.number && this.state.name && this.state.cvc && this.state.expiry) ||
                (this.state.number.length < 16 && this.state.name.split(" ").length < 2 && this.state.cvc.length < 3 && this.state.expiry.length < 4)) {
                alert("Please Check yout input details")

            }
            else {

                const cardsRef = collection(firestore, "Cards");

                let realCardNum = '';
                for (let index = 0; index < this.state.number.length; index++) {
                    if (index != 0 && index % 4 === 0) {
                        realCardNum += ' ';
                    }
                    realCardNum += this.state.number.charAt(index);
                }

                let realExpiry = '';
                realExpiry += this.state.expiry.charAt(0);
                realExpiry += this.state.expiry.charAt(1);
                realExpiry += '/';
                realExpiry += this.state.expiry.charAt(2);
                realExpiry += this.state.expiry.charAt(3);

                const q5 = query(cardsRef, where("cardNumber", '==', realCardNum), where("cardholderName", "==", this.state.name), where("cvv", "==", this.state.cvc), where("expiryMMYY", "==", realExpiry));

                console.log(realExpiry);

                const snapshot = await getDocs(q5);

                snapshot.forEach(data => {
                    const cardData = data.data();

                    console.log(cardData);

                    if (cardData.amount < amount) {
                        sendError(merchant.links.rejectURL, 'Low Balance in the Demo Card, Contact your Merchant for Load up your card')
                    }

                    else {
                        const cardsRef = doc(firestore, "Cards", realCardNum);
                        const transaction = cardData.cardNumber.charAt(0) + cardData.cardNumber.charAt(2) + ((Math.random() * 100) + 1) + Date.now().toString();
                        updateDoc(cardsRef, {
                            "amount": increment(((-1) * amount)),
                            "refBills": arrayUnion({
                                transactionID: transaction,
                                amount: amount,
                                date: Date.now().toString()
                            })
                        }).then(() => {
                            sendResponse(merchant.links.successURL, transaction, true, 'Transaction Successfull')
                        }).catch(err => {
                            console.log(err.message);
                            sendError(merchant.links.rejectURL, 'Server Respond Failed')
                        });
                    }

                })
                if (snapshot.docs.length === 0) {
                    sendError(merchant.links.rejectURL, 'Card or Merchant Details are Incorrect')

                }

            }
        }
        return (
            <div id="PaymentForm">


                <Cards
                    cvc={this.state.cvc}
                    expiry={this.state.expiry}
                    focused={this.state.focus}
                    name={this.state.name}
                    number={this.state.number}
                />


                <div className='form'>

                    <input
                        className='input_fields'
                        type="tel"
                        name="number"
                        placeholder="Card Number"
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                        maxLength={16}
                    />

                    <br />
                    <input
                        className='input_fields'
                        type="name"
                        name="name"
                        placeholder="Full Name"
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                    />

                    <br />
                    <input
                        className='input_fields'
                        type="expiry"
                        name="expiry"
                        placeholder="Expiry Date"
                        maxLength={4}
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                    />

                    <br />
                    <input
                        className='input_fields'
                        type="cvv"
                        name="cvc"
                        placeholder="CVV Code"
                        maxLength={3}
                        onChange={this.handleInputChange}
                        onFocus={this.handleInputFocus}
                    />

                    <br />

                    <button id='btncheckout'
                        onClick={postDataL}
                    >
                        Checkout
                    </button>

                </div>

            </div>
        )
    }
}
