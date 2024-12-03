// ExampleComponent.js
import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const ExampleComponent = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleAddUser = async () => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        first: firstName,
        last: lastName,
      });
      console.log('Document written with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };
  const [users, setUsers] = useState([]);

  // Function to fetch users from Firestore
  const fetchUsers = async () => {
    try {
      // Reference to the "users" collection
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
      console.log(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
};

export default ExampleComponent;
