import React, { useRef, useState } from "react";
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";


function Signup() {
  let nameElement = useRef();
  let emailElement = useRef();
  let passwordElement = useRef();
  let confirmPasswordElement = useRef();
  let [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createUserDocument = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);

    if (!userData.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          name: displayName ? displayName : nameElement.current.value,
          email,
          photoURL: photoURL ? photoURL : "",
          createdAt,
        });
        toast.success("Account Created!");
      } catch (error) {
        toast.error(error.message);
        console.error("Error creating user document: ", error);
      }
    }
    setLoading(false);
  };

  const signUpWithEmail = async (e) => {
    e.preventDefault();
    const name = nameElement.current.value;
    const email = emailElement.current.value;
    const password = passwordElement.current.value;
    const confirmPassword = confirmPasswordElement.current.value;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;
      await createUserDocument(user);
      toast.success("Successfully Signed Up!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
      console.error(
        "Error signing up with email and password: ",
        error.message
      );
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocument(user);
      toast.success("User Authenticated Successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
      console.error("Error signing in with Google: ", error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card mt-5 shadow-lg">
              <div className="card-header text-center bg-primary text-white">
                SignUp on <b>TrackMyFin</b>
              </div>
              <div className="card-body">
                <form>
                  <div className="form-group row">
                    <label
                      htmlFor="name"
                      className="col-md-4 col-form-label text-md-right"
                    >
                      Name
                    </label>
                    <div className="col-md-6">
                      <input
                        id="name"
                        type="text"
                        ref={nameElement}
                        className="form-control"
                        name="name"
                        placeholder="Enter your Name"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <hr />
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
                  <div className="form-group row">
                    <label
                      htmlFor="confirmpassword"
                      className="col-md-4 col-form-label text-md-right"
                    >
                      Confirm Password
                    </label>
                    <div className="col-md-6">
                      <input
                        id="confirmpassword"
                        type="password"
                        ref={confirmPasswordElement}
                        className="form-control"
                        name="confirmpassword"
                        placeholder="Confirm your Password"
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
                        onClick={signUpWithEmail}
                        disabled={loading}
                      >
                        {loading
                          ? "Signing Up..."
                          : "Sign Up Using Email and Password"}
                      </button>
                    </div>
                    <div className="col-md-12">Or</div>
                    <div className="col-md-12">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={signInWithGoogle}
                        disabled={loading}
                      >
                        {loading
                          ? "Signing Up with Google..."
                          : "Sign Up Using Google"}
                      </button>
                    </div>
                  </div>
                  <hr />
                  <div className="form-group row text-center">
                    {/* Update the link to prevent default and use navigate */}
                    <Link to="/login" className="text-decoration-none">
                      Or Have An Account Already? Click Here
                    </Link>
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

export default Signup;
