import React, { useState, useRef } from "react";
import { fetchLogin, LoginParams } from "../../fetch";
import { useNavigate } from "react-router-dom";
import { setCookie } from "typescript-cookie";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const userRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (userid === "") return userRef.current?.focus();
    if (password === "") return passwordRef.current?.focus();
    const params: LoginParams = { userid, password };

    const res = await fetchLogin("/user/login", params);
    if (res.status === true) {
      setCookie("userid", userid);
      setCookie("token", res.data.token);
      navigate("/main");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-center text-2xl font-bold mb-4">Login</h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              ref={userRef}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              autoComplete="username"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (userid !== "" || password !== "") {
                    handleLogin();
                  } else {
                    passwordRef.current?.focus();
                  }
                }
              }}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              ref={passwordRef}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (userid !== "" || password !== "") {
                    handleLogin();
                  }
                }
              }}
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
