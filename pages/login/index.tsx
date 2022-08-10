import React, { useEffect, useState, useContext } from "react";
import styles from "./index.module.scss";
import OnboardingLayout from "../../components/OnboardingLayout";
import OnboardingInput from "../../components/OnboardingInput";
import OnboardingButton from "../../components/OnboardingButton";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../hooks/app";
import { set as setUser } from "../../store/reducers/userSlice";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../../connectors";
import { UserDs } from "../../ds";
import { AuthContext } from "../../contexts/AuthContext";

const Index = () => {
  const [state, setState] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { account, active, activate } = useWeb3React();
  const { user, isAuthenticated, signIn } = useContext(AuthContext);

  useEffect(() => {
    if (!active) activate(injected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setError("");
    if (!account) {
      toast.info("Please connect with metamask to login");
      return;
    }

    const pattern =
      /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;
    const result = pattern.test(state.email);
    if (!state.email) return setError("Email field is empty");
    if (!state.password) return setError("Password field is empty");
    if (!result) return setError("Invalid email, check email and try again");
    if (state.password.length < 6)
      return setError("Password must have six (6) characters");

    try {
      const res = await signIn({
        email: state.email,
        password: state.password,
      });
      toast.success("Welcome to Akara, Login successful.");
      console.log("new signin result here ", res);
    } catch (error: any) {
      console.log(error);
      toast.error(error.error?.message);
    }
  };

  return (
    <OnboardingLayout>
      <div className={styles.login}>
        <h6 className={styles.title}>Login</h6>
        <p className={styles.text}>Log in with your email address</p>
        {error !== "" && <span className={styles.error}>{error}</span>}
        <div className={styles.inputs}>
          <OnboardingInput
            onChange={handleChange}
            name="email"
            label="Email"
            type="email"
            placeholder="sarah@gmail.com"
          />
          <OnboardingInput
            onChange={handleChange}
            name="password"
            label="Password"
            type="password"
            placeholder="***********"
          />
        </div>
        <OnboardingButton onClick={handleSubmit} text="Log in" />
        <span
          className={styles.forgot}
          onClick={() => router.push("/forgot-password")}
        >
          Forgot Password
        </span>
        <span className={styles.continue}>Or continue with</span>
        <div className={styles.socials}>
          <span>
            <FcGoogle />
          </span>
          <span>
            <FaFacebook color="#1877F2" />
          </span>
        </div>
        <p>
          Don’t have an account?{" "}
          <span
            className={styles.signup}
            onClick={() => router.push("/signup")}
          >
            {" "}
            Sign up
          </span>
        </p>
      </div>
    </OnboardingLayout>
  );
};

export default Index;
