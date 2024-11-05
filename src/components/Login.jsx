import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { toast } from 'react-toastify';
import Navbar from './navbar';


function Login() {
  let emailElement = useRef();
  let passwordElement = useRef();
  const [loading, setLoading] = useState(false); // Initialize loading state
  const navigate = useNavigate();

  const clearInputs = () => {
    emailElement.current.value = '';
    passwordElement.current.value = '';
  };

  const handleLoginSuccess = (user) => {
    navigate('/dashboard');
    toast.success('Logged In Successfully!');
    clearInputs();
    setLoading(false);
  };

  const signInWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    let email = emailElement.current.value;
    let password = passwordElement.current.value;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleLoginSuccess(result.user);
    } catch (error) {
      toast.error(error.message);
      console.error('Error signing in with email and password:', error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 mt-5">
            <div className="card mt-5 shadow-lg">
              <div className="card-header text-center bg-primary text-white">
                LogIn on <b>TrackMyFin</b>
              </div>
              <div className="card-body">
                <form>
                  <div className="form-group row">
                    <label
                      htmlFor="email"
                      className="col-md-4 col-form-label text-md-right"
                    >
                      Email
                    </label>
                    <div className="col-md-6">
                      <input
                        id="email"
                        type="email"
                        ref={emailElement}
                        className="form-control"
                        name="email"
                        placeholder="Enter your Email"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <hr />
                  <div className="form-group row">
                    <label
                      htmlFor="password"
                      className="col-md-4 col-form-label text-md-right"
                    >
                      Password
                    </label>
                    <div className="col-md-6">
                      <input
                        id="password"
                        type="password"
                        ref={passwordElement}
                        className="form-control"
                        name="password"
                        placeholder="Enter your Password"
                        required
                      />
                    </div>
                  </div>
                  <hr />
                  <div className="form-group row text-center">
                    <div className="col-md-12">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={signInWithEmail}
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'LogIn '}
                      </button>
                    </div>
                  </div>
                  <hr />
                  <div className="form-group row text-center">
                    <a href="/" className="text-decoration-none">
                      Don't Have An Account Already? Click Here
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
