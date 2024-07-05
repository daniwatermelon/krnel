import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();

const signOutUser = () => {
    return signOut(auth)
        .then(() => {
            // Sign-out successful.
            console.log('Sign-out successful');
        })
        .catch((error) => {
            // An error happened.
            console.error('An error happened during sign-out:', error);
        });
};

export default signOutUser;