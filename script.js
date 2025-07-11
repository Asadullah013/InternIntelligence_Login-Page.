// ✅ Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCehse0_5v4TyFdEFSY3i_P9YafPoerN8g",
  authDomain: "login-page-98f3f.firebaseapp.com",
  projectId: "login-page-98f3f",
  storageBucket: "login-page-98f3f.appspot.com",
  messagingSenderId: "639077988116",
  appId: "1:639077988116:web:3de365257a084e18333401",
  measurementId: "G-Y8YRSRVE1J"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clearErrors = (form) => $$(".error-msg", form).forEach((e) => e.remove());
const showError = (form, msg) => {
  clearErrors(form);
  const p = document.createElement("p");
  p.className = "error-msg";
  p.textContent = msg;
  form.appendChild(p);
};
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isPassword = (p) => p.length >= 6;

// ✅ LOGIN
const loginForm = $("#loginform");
if (loginForm) {
  const emailIn = $("#email", loginForm);
  const passIn = $("#password", loginForm);
  const remember = $("#rememberMe", loginForm);

  // Remember Me
  const remembered = localStorage.getItem("rememberedEmail");
  if (remembered) {
    emailIn.value = remembered;
    remember.checked = true;
  }

  // Forgot Password
  const forgotLink = $(".forgot-link");
  if (forgotLink) {
    forgotLink.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = emailIn.value.trim();
      if (!isEmail(email)) return showError(loginForm, "Please enter a valid email.");
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent!");
      } catch (err) {
        showError(loginForm, err.message || "Failed to send reset email.");
      }
    });
  }

  // Login Submit
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(loginForm);

    const email = emailIn.value.trim();
    const pass = passIn.value;

    if (!isEmail(email)) return showError(loginForm, "Enter a valid email.");
    if (!isPassword(pass)) return showError(loginForm, "Password ≥ 6 characters.");

    remember.checked
      ? localStorage.setItem("rememberedEmail", email)
      : localStorage.removeItem("rememberedEmail");

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      alert("Login successful!");
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(loginForm, err.message || "Login failed.");
    }
  });
}

// ✅ SIGNUP
const signupForm = $("#signupform");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(signupForm);

    const name = $("#name").value.trim();
    const email = $("#email").value.trim();
    const phone = $("#phone").value.trim();
    const address = $("#address").value.trim();
    const pass = $("#password").value;

    if (![name, email, phone, address, pass].every(Boolean)) {
      return showError(signupForm, "Please fill in all fields.");
    }
    if (!isEmail(email)) return showError(signupForm, "Enter a valid email.");
    if (!isPassword(pass)) return showError(signupForm, "Password ≥ 6 characters.");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        phone,
        address
      });

      alert("Signup successful!");
      // window.location.href = "dashboard.html"; // optional
    } catch (err) {
      showError(signupForm, err.message || "Signup failed.");
    }
  });
}

// ✅ DASHBOARD
const logoutBtn = $("#logoutBtn");
if (logoutBtn) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      const data = docSnap.data();
      $("#name").textContent = data.name;
      $("#email").textContent = data.email;
      $("#phone").textContent = data.phone;
      $("#address").textContent = data.address;
    } else {
      window.location.href = "index.html";
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });
}
