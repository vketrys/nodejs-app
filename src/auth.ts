import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import app from './config/firebase.js';

export const signup = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(422).json({
      email: 'email is required',
      password: 'password is required',
    });
  }
  const auth = getAuth(app);
  createUserWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((data) => {
      return res.status(201).json(data);
    })
    .catch(function (error) {
      if (error.code == 'auth/weak-password') {
        return res.status(500).json({ error: error.message });
      } else {
        return res.status(500).json({ error: error.message });
      }
    });
};

export const signin = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(422).json({
      email: 'email is required',
      password: 'password is required',
    });
  }
  const auth = getAuth(app);
  signInWithEmailAndPassword(auth, req.body.email, req.body.password)
    .then((user) => {
      return res.status(201).json(user);
    })
    .catch(function (error) {
      if (error.code == 'auth/wrong-password') {
        return res.status(500).json({ error: error.message });
      } else {
        return res.status(500).json({ error: error.message });
      }
    });
};
