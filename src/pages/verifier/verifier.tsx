import React, {useEffect, useState} from 'react';
import {Button, FormControl} from 'react-bootstrap';
import 'pages/verifier/verifier.scss'
import ApiService from 'utils/apiService';
import {GetSavedCredentialsOutput, UnsignedW3cCredential, W3cCredential} from 'utils/apis';

interface State {
  currentUnsignedVC: UnsignedW3cCredential | null,
  currentSignedVC: W3cCredential | null,
  isCurrentVCVerified: boolean,
  storedVCs: GetSavedCredentialsOutput,
  isLoadingStoredVCs: boolean
}

/**
 * Stateful component responsible for rendering the showcase of this app.
 * The basic parts of SSI cycle are covered with this component.
 * */
const Verifier = () => {
  const [state, setState] = useState<State>({
    currentUnsignedVC: null,
    currentSignedVC: null,
    isCurrentVCVerified: false,
    storedVCs: [],
    isLoadingStoredVCs: true
  })
  const [inputVC, setinputVC] = useState('')

  /**
   * Get stored VCs from user cloud wallet on component mount.
   * */
  useEffect(() => {
    const getSavedVCs = async () => {
      try {
        const arrayOfStoredVCs = await ApiService.getSavedVCs();

        setState({
          ...state,
          storedVCs: [...arrayOfStoredVCs],
          isLoadingStoredVCs: false
        })
      } catch (error) {
        ApiService.alertWithBrowserConsole(error.message)

        setState({
          ...state,
          isLoadingStoredVCs: false
        })
      }
    }

    getSavedVCs();
  }, []);

  /**
   * Function for verifying a signed VC.
   * */
  const verifyVC = async () => {
    try {
      if( isJson(inputVC) ) {
        const vc = JSON.parse(inputVC)
        const {isValid, errors} = await ApiService.verifyVC({
          verifiableCredentials: [vc]
        });

        if( isValid ) {
          setState({
            ...state,
            isCurrentVCVerified: true,
          })

          alert('Signed VC successfully verified.');
        }
        else {
          ApiService.alertWithBrowserConsole(errors, 'Signed VC not verified. Check console for errors.')
        }
      }
      else {
        alert('No signed VC found. Please sign a VC and try again.')
      }
    } catch (error) {
      ApiService.alertWithBrowserConsole(error.message);
    }
  }

  const onVCValueChange = (value: string) => {
    setinputVC(value)   
  }

  const isJson = (str: string) => {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
  }

  return (
    <div className='tutorial-verifier'>
      {/* <div className='tutorial__column tutorial__column--verifier'>
        <h3 className='tutorial__column-title'>Verifier</h3>
        <div className='tutorial__column-steps'>
          <div className='tutorial__step'> */}
            <span className='tutorial__step-text'>
              {/* <strong>Step 4:</strong>  */}
              Verify VC
            </span>
            <FormControl
              as="textarea"
              rows={15}
              placeholder="Enter Verifiable Credential"
              aria-label="Verifiable Credential"
              aria-describedby="basic-addon1"
              value={inputVC}
              onChange={e => onVCValueChange(e.target.value)}
              style={{margin: '20px 0'}}
            />
            <Button onClick={verifyVC}>Verify signed VC</Button>
          {/* </div>
        </div>
      </div> */}
    </div>
  )
}

export default Verifier;
